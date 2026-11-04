module.exports = async function(req, res, pool) {
  let db = 'down'; try { await pool.query('SELECT 1'); db = 'healthy'; } catch {}
  res.json({ database: db, storage: 'healthy', backup: process.env.LAST_BACKUP_AT || 'unknown',
    integrations: { stripe: !!process.env.STRIPE_KEY, meta: !!process.env.FB_TOKEN, whatsapp: !!process.env.WHATSAPP_TOKEN, groq: !!process.env.GROQ_API_KEY },
    version: process.env.APP_VERSION || '1.0.0', maintenance: process.env.MAINTENANCE === 'true' });
};
