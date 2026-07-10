require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initWebSocketServer } = require('./websocket/hub');

// ── Route imports ──────────────────────────────────────────────
const sessionsRouter = require('./routes/sessions');
const inspectRouter  = require('./routes/inspect');
const requestsRouter = require('./routes/requests');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Raw body middleware — MUST come before express.json()
// We need the raw body so we can display exactly what was received
app.use((req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/sessions', sessionsRouter);
app.use('/i',            inspectRouter);   // POST /i/:id — webhook receiver
app.use('/api/requests', requestsRouter);

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ───────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ DropHook backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/ping`);
});

// Attach WebSocket server to the same HTTP server
initWebSocketServer(server);