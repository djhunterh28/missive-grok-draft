// CORS relay for the Write with Grok Missive integration.
// Forwards a browser POST to a Grok Bot routine webhook, adding the
// Authorization header server-side so the request is not a cross-origin
// browser call to api2.cursor.sh (which omits Access-Control-Allow-Origin).
//
// Expected request:
//   POST /
//   Origin: https://djhunterh28.github.io
//   Authorization: Bearer <routine key>
//   Content-Type: application/json
//   X-Webhook-Url: https://api2.cursor.sh/automations/webhook/<id>
//   body: JSON payload for the routine
//
// Deploy: create a free Cloudflare Worker, paste this file as the worker
// script, and deploy. Then paste the workers.dev URL into the integration's
// "CORS relay URL" field in Missive. Do not store the webhook key in this
// worker; the browser sends it per request.

const ALLOWED_ORIGINS = [
  'https://djhunterh28.github.io',
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Webhook-Url',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(status, origin, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}

function isAllowedWebhook(url) {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' &&
      (u.hostname === 'api2.cursor.sh' || u.hostname.endsWith('.cursor.sh')) &&
      u.pathname.startsWith('/automations/webhook/')
    );
  } catch (err) {
    return false;
  }
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return json(405, origin, { error: 'Method not allowed' });
    }

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return json(403, origin, { error: 'Origin not allowed' });
    }

    const auth = request.headers.get('Authorization') || '';
    const target = request.headers.get('X-Webhook-Url') || '';

    if (!auth) {
      return json(401, origin, { error: 'Missing Authorization header' });
    }
    if (!isAllowedWebhook(target)) {
      return json(400, origin, { error: 'Invalid or missing X-Webhook-Url' });
    }

    const body = await request.text();
    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
      body,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
