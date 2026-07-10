const express = require('express');
const router  = express.Router();
const { query } = require('../db');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(apiLimiter);

// GET /api/requests/:sessionId
// Returns all requests for a session, newest first
// Supports pagination: ?limit=50&offset=0
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const limit  = Math.min(parseInt(req.query.limit)  || 50, 100);
  const offset = parseInt(req.query.offset) || 0;

  try {
    // Verify session exists first
    const { rows: session } = await query(
      `SELECT id FROM sessions WHERE id = $1`,
      [sessionId]
    );

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Fetch requests — exclude body here for performance
    // Body is only fetched when user clicks into a single request
    const { rows } = await query(
      `SELECT id, session_id, received_at, method, body_size, source_ip, content_type
       FROM requests
       WHERE session_id = $1
       ORDER BY received_at DESC
       LIMIT $2 OFFSET $3`,
      [sessionId, limit, offset]
    );

    res.json({ requests: rows, limit, offset });
  } catch (err) {
    console.error('[GET /api/requests/:sessionId]', err.message);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /api/requests/:sessionId/:requestId
// Returns a single request with FULL body and headers
router.get('/:sessionId/:requestId', async (req, res) => {
  const { sessionId, requestId } = req.params;

  try {
    const { rows } = await query(
      `SELECT id, session_id, received_at, method, headers, body,
              body_size, source_ip, content_type
       FROM requests
       WHERE id = $1 AND session_id = $2`,
      [requestId, sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request: rows[0] });
  } catch (err) {
    console.error('[GET /api/requests/:sessionId/:requestId]', err.message);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// POST /api/requests/:sessionId/:requestId/replay
// Re-fires a stored request to a user-supplied target URL
router.post('/:sessionId/:requestId/replay', async (req, res) => {
  const { sessionId, requestId } = req.params;
  const { targetUrl } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl is required' });
  }

  try {
    // Fetch the full original request
    const { rows } = await query(
      `SELECT method, headers, body FROM requests
       WHERE id = $1 AND session_id = $2`,
      [requestId, sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const original = rows[0];
    const start    = Date.now();

    // Re-fire the request to the target URL
    const replayRes = await fetch(targetUrl, {
      method:  original.method,
      headers: {
        'Content-Type': original.headers['content-type'] || 'application/json',
        'X-Replayed-By': 'DropHook',
      },
      body: ['GET', 'HEAD'].includes(original.method) ? undefined : original.body,
    });

    const responseTime = Date.now() - start;

    res.json({
      status:        replayRes.status,
      response_time: responseTime,
      ok:            replayRes.ok,
    });
  } catch (err) {
    console.error('[POST /replay]', err.message);
    res.status(500).json({ error: 'Replay failed', message: err.message });
  }
});

module.exports = router;