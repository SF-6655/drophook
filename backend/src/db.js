const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.slxexzbrdkvtlqaeubqx:drophook2026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis:       30000,
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