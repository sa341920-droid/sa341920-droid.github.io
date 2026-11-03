// Vercel serverless entry point. Configure DATABASE_URL and JWT_SECRET
// in the Vercel project environment before deploying.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters');
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
module.exports = require('../src/server');
