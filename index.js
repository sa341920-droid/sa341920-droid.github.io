// Vercel serverless entry point. Configure DATABASE_URL and JWT_SECRET
// in the Vercel project environment before deploying.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters');
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
if (process.env.NODE_ENV === 'production' && (!process.env.FRONTEND_ORIGIN || process.env.FRONTEND_ORIGIN.includes('localhost') || !process.env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL.includes('example'))) {
  throw new Error('Set FRONTEND_ORIGIN and PUBLIC_SITE_URL to the real storefront origin');
}
module.exports = require('../src/server');
