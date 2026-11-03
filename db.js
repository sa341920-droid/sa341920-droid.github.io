const { Pool } = require('pg');

// Small pool is important for serverless platforms where many short-lived
// function instances can otherwise exhaust the database connection limit.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: Number(process.env.PG_POOL_MAX || 3),
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});
pool.on('error', (err) => console.error('Unexpected PostgreSQL pool error', err));
module.exports = { pool, query: (...args) => pool.query(...args) };
