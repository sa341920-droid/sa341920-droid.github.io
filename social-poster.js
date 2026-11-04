const fetch = require('node-fetch');
const SITE = process.env.SITE_URL || 'https://sa341920-droid.github.io';
async function pickFeatured() {
  try { const r = await fetch(`${SITE}/api/products?featured=true`); const l = await r.json(); return (l.products||l||[])[0]||null; } catch { return null; }
}
function caption(p){ return p ? `✨ ${p.name}\n💰 Rs. ${p.price}\n${SITE}/product/${p.slug||p.id}` : `🛍️ Royal Mobile & Printing Store\n${SITE}`; }
async function fb(t,i){ if(!process.env.FB_TOKEN) return; await fetch(`https://graph.facebook.com/v19.0/${process.env.FB_PAGE_ID}/photos`,{method:'POST',body:new URLSearchParams({url:i,caption:t,access_token:process.env.FB_TOKEN})}); console.log('✅ FB'); }
async function ig(t,i){ if(!process.env.IG_TOKEN) return; const c=await fetch(`https://graph.facebook.com/v19.0/${process.env.IG_BUSINESS_ID}/media`,{method:'POST',body:new URLSearchParams({image_url:i,caption:t,access_token:process.env.IG_TOKEN})}); const {id}=await c.json(); await fetch(`https://graph.facebook.com/v19.0/${process.env.IG_BUSINESS_ID}/media_publish`,{method:'POST',body:new URLSearchParams({creation_id:id,access_token:process.env.IG_TOKEN})}); console.log('✅ IG'); }
(async()=>{ const p=await pickFeatured(); const t=caption(p); const i=(p&&p.image)||`${SITE}/og-cover.jpg`; await fb(t,i); await ig(t,i); console.log('Done',new Date().toISOString()); })();
