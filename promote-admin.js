require('dotenv').config();
const { pool } = require('../src/db');

(async () => {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  if (!email || !email.includes('@') || process.argv[3] !== '--confirm') {
    console.error('Usage: npm run admin:promote -- owner@example.com --confirm');
    process.exitCode = 2;
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE');
    const admins = await client.query("SELECT count(*)::int AS count FROM users WHERE role='ADMIN'");
    if (admins.rows[0].count > 0) throw new Error('An ADMIN already exists. Refusing one-time bootstrap promotion.');
    const updated = await client.query(
      "UPDATE users SET role='ADMIN' WHERE email=$1 AND is_active=true RETURNING id,email,role",
      [email]
    );
    if (!updated.rowCount) throw new Error('No active account found for that email. Register the owner account first.');
    await client.query('COMMIT');
    console.log(`First admin created: ${updated.rows[0].email}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
