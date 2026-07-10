const { Pool } = require('pg');
const dns = require('dns');

// Force IPv4 DNS resolution globally
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  host:     'db.slxexzbrdkvtlqaeubqx.supabase.co',
  port:     5432,
  database: 'postgres',
  user:     'postgres',
  password: 'drophook2026',
  ssl:      { rejectUnauthorized: false },
  max:      10,
  idleTimeoutMillis:    30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

const query = (text, params) => pool.query(text, params);

pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL connection failed:', err.message));

module.exports = { query, pool };