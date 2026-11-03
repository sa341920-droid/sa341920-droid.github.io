/*
Payment gateway adapter boundary.
Do not trust a browser redirect as proof of payment. Production provider adapters must:
1) create a hosted payment session server-side, 2) use unique merchant order references,
3) verify provider callback signature using raw request body, 4) query provider status server-to-server,
5) mark paid exactly once after verified success.
The provider varies by merchant contract. Keep secrets only in server environment variables.
*/
async function createOnlineSession({order,customer}) {
 const provider=process.env.PAYMENT_PROVIDER;
 if(!provider||provider==='manual') throw Object.assign(new Error('Online gateway is not configured. Set PAYMENT_PROVIDER and merchant credentials.'),{status:503});
 // Adapter is intentionally fail-closed: no made-up payment session is returned.
 throw Object.assign(new Error(`Provider adapter for "${provider}" must be implemented against the merchant's approved API before live checkout.`),{status:503});
}
function verifyWebhook(req){throw Object.assign(new Error('Webhook signature verifier must be implemented for the selected gateway.'),{status:503})}
module.exports={createOnlineSession,verifyWebhook};
