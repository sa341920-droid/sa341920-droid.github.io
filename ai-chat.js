const fetch = require('node-fetch');
const SYSTEM = `You are Royal Mobile & Printing Store support agent. Help with orders, returns, products, printing quotes. Reply in customer's language (Urdu/Roman Urdu/English).`;
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { messages = [] } = req.body || {};
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'AI not configured' });
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: SYSTEM }, ...messages], max_tokens: 500 })
    });
    const d = await r.json();
    res.json({ reply: d.choices?.[0]?.message?.content || 'Try again.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
