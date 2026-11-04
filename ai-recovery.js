const fetch = require('node-fetch');
module.exports = async function(q, a) {
  if (!process.env.GROQ_API_KEY) return true;
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: `Q:"${q}" A:"${a}" Genuine? YES/NO only.` }], max_tokens: 5 })
  });
  const d = await r.json();
  return (d.choices?.[0]?.message?.content || '').toUpperCase().includes('YES');
};
