const express = require('express');
const router  = express.Router();
const { query } = require('../db');
const { generateId } = require('../utils/generateId');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(apiLimiter);

// POST /api/sessions
// Creates a new inspector session and returns its URL
router.post('/', async (req, res) => {
  try {
    const id         = generateId();
    const expiryHrs  = parseInt(process.env.SESSION_EXPIRY_HOURS) || 24;
    const expiresAt  = new Date(Date.now() + expiryHrs * 60 * 60 * 1000);
    const baseUrl    = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;

    await query(
      `INSERT INTO sessions (id, expires_at) VALUES ($1, $2)`,
      [id, expiresAt]
    );

    res.status(201).json({
      id,
      url:        `${baseUrl}/i/${id}`,
      expires_at: expiresAt,
    });
  } catch (err) {
    console.error('[POST /api/sessions]', err.message);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/:id
// Returns session metadata — expiry, request count, active status
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, created_at, expires_at, request_count FROM sessions WHERE id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = rows[0];
    const active  = new Date(session.expires_at) > new Date();

    res.json({ ...session, active });
  } catch (err) {
    console.error('[GET /api/sessions/:id]', err.message);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// DELETE /api/sessions/:id
// Deletes session + all its requests (CASCADE handles requests table)
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM sessions WHERE id = $1`,
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/sessions/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;