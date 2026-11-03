/**
 * Cloudflare Pages Function: same-origin proxy for the existing Node API.
 * Configure API_ORIGIN in Cloudflare Pages > Settings > Variables and Secrets.
 * Example: https://your-node-api.example.com
 * The Express/PostgreSQL API must be deployed separately on a Node-capable host.
 */
export async function onRequest({ request, env }) {
  if (!env.API_ORIGIN) {
    return new Response(JSON.stringify({ error: "API is not configured. Set the API_ORIGIN Pages environment variable." }), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    });
  }

  let apiOrigin;
  try {
    apiOrigin = new URL(env.API_ORIGIN);
    if (!["https:", "http:"].includes(apiOrigin.protocol) || apiOrigin.username || apiOrigin.password) throw new Error("Invalid API origin");
  } catch {
    return new Response(JSON.stringify({ error: "API_ORIGIN must be a valid http(s) origin without credentials." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    });
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, apiOrigin.origin);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));

  const upstreamRequest = new Request(target, request);
  const proxyRequest = new Request(upstreamRequest, { headers, redirect: "manual" });
  const upstream = await fetch(proxyRequest);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("cache-control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}
