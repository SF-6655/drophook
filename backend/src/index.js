require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initWebSocketServer } = require('./websocket/hub');

const sessionsRouter = require('./routes/sessions');
const inspectRouter  = require('./routes/inspect');
const requestsRouter = require('./routes/requests');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Raw body capture — only for the webhook receiver route
app.use('/i', (req, res, next) => {
  let chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks).toString('utf8');
    next();
  });
  req.on('error', next);
});

// JSON parsing for all other routes
app.use((req, res, next) => {
  if (req.path.startsWith('/i/')) return next();
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/i/')) return next();
  express.urlencoded({ extended: true })(req, res, next);
});

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/sessions', sessionsRouter);
app.use('/i',            inspectRouter);
app.use('/api/requests', requestsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(PORT, () => {
  console.log(`✅ DropHook backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/ping`);
});

initWebSocketServer(server);