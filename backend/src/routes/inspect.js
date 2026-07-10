const express = require('express');
const router  = express.Router();
const { query } = require('../db');
const { sanitizeHeaders } = require('../utils/sanitize');
const { broadcastToSession } = require('../websocket/hub');
const { webhookLimiter } = require('../middleware/rateLimit');

// POST /i/:id
// THE core endpoint — receives any HTTP request and stores it.
// This is what users paste into Stripe, GitHub, Twilio etc.
// Must respond instantly (< 200ms) — webhook senders time out fast.
router.all('/:id', webhookLimiter, async (req, res) => {
  const sessionId = req.params.id;

  try {
    // 1. Check session exists and hasn't expired
    const { rows } = await query(
      `SELECT id, expires_at FROM sessions WHERE id = $1`,
      [sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      return res.status(410).json({ error: 'Session expired' });
    }

    // 2. Sanitize headers — redact Authorization, cookies etc.
    const safeHeaders = sanitizeHeaders(req.headers);

    // 3. Store the incoming request in PostgreSQL
    const body        = req.rawBody || '';
    const contentType = req.headers['content-type'] || null;
    const sourceIp    = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    const { rows: inserted } = await query(
      `INSERT INTO requests
         (session_id, method, headers, body, body_size, source_ip, content_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, session_id, received_at, method, body_size, source_ip, content_type`,
      [
        sessionId,
        req.method,
        JSON.stringify(safeHeaders),
        body,
        Buffer.byteLength(body, 'utf8'),
        sourceIp,
        contentType,
      ]
    );

    // 4. Increment session request count
    await query(
      `UPDATE sessions SET request_count = request_count + 1 WHERE id = $1`,
      [sessionId]
    );

    // 5. Broadcast to all WebSocket clients watching this session
    // We only send lightweight metadata over WS — full body is fetched on demand
    const newRequest = inserted[0];
    broadcastToSession(sessionId, {
      id:           newRequest.id,
      method:       newRequest.method,
      received_at:  newRequest.received_at,
      content_type: newRequest.content_type,
      body_size:    newRequest.body_size,
      source_ip:    newRequest.source_ip,
    });

    // 6. Respond immediately — webhook senders don't care about our response
    res.status(200).json({ received: true });

  } catch (err) {
    console.error('[POST /i/:id]', err.message);
    res.status(500).json({ error: 'Failed to capture request' });
  }
});

module.exports = router;