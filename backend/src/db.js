const { Pool } = require('pg');

// Connection pool — reuses connections instead of opening a new one
// per query. Critical for performance with PostgreSQL on Supabase.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,                // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

// Wrapper so every file can do: const { query } = require('./db')
const query = (text, params) => pool.query(text, params);

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL connection failed:', err.message));

module.exports = { query, pool };