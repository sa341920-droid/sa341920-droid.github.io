const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('./db');

function sign(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h', issuer: 'royal-marketplace', audience: 'royal-marketplace-users' }
  );
}

async function hashPassword(password) { return bcrypt.hash(password, 12); }
async function comparePassword(password, hash) { return bcrypt.compare(password, hash); }

// Resolve the current role and active state from PostgreSQL on every request.
// This prevents a stale JWT from retaining ADMIN/SELLER access after a role change.
async function auth(req, res, next) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) return res.status(503).json({ error: 'Authentication service is not configured' });
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try {
    const claims = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      issuer: 'royal-marketplace', audience: 'royal-marketplace-users'
    });
    const result = await query(
      'SELECT id, name, email, phone, role FROM users WHERE id=$1 AND is_active=true',
      [claims.sub]
    );
    if (!result.rowCount) return res.status(401).json({ error: 'Account is inactive or unavailable' });
    const user = result.rows[0];
    req.user = { sub: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return next(error);
  }
}

function allow(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permission' });
    return next();
  };
}

module.exports = { sign, hashPassword, comparePassword, auth, allow };
