const { WebSocketServer, WebSocket } = require('ws');

// Map of sessionId → Set of connected WebSocket clients
// e.g. { "abc123": Set { ws1, ws2 } }
// Multiple people can watch the same session simultaneously
const rooms = new Map();

const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  console.log('✅ WebSocket server attached');

  wss.on('connection', (ws) => {
    let subscribedSession = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Client sends: { "type": "subscribe", "sessionId": "abc123" }
        if (msg.type === 'subscribe' && msg.sessionId) {
          subscribedSession = msg.sessionId;

          // Create room if it doesn't exist
          if (!rooms.has(subscribedSession)) {
            rooms.set(subscribedSession, new Set());
          }

          rooms.get(subscribedSession).add(ws);
          console.log(`[WS] Client subscribed to session: ${subscribedSession}`);

          // Confirm subscription
          ws.send(JSON.stringify({
            type: 'subscribed',
            sessionId: subscribedSession,
          }));
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err.message);
      }
    });

    ws.on('close', () => {
      // Clean up — remove client from their room
      if (subscribedSession && rooms.has(subscribedSession)) {
        rooms.get(subscribedSession).delete(ws);

        // If room is empty, delete it
        if (rooms.get(subscribedSession).size === 0) {
          rooms.delete(subscribedSession);
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] Client error:', err.message);
    });
  });
};

// Called by the webhook receiver route when a new request arrives
// Broadcasts the new request to all clients watching that session
const broadcastToSession = (sessionId, data) => {
  if (!rooms.has(sessionId)) return;

  const message = JSON.stringify({ type: 'new_request', data });

  rooms.get(sessionId).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Called when a session expires — tells all clients to redirect
const broadcastExpired = (sessionId) => {
  if (!rooms.has(sessionId)) return;

  const message = JSON.stringify({ type: 'session_expired' });

  rooms.get(sessionId).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      client.close();
    }
  });

  rooms.delete(sessionId);
};

module.exports = { initWebSocketServer, broadcastToSession, broadcastExpired };