# Write with Grok (Missive integration)

A custom Missive UI/iFrame integration that adds a **Write with Grok** action in the draft window and conversation menu. Clicking it asks a Grok Bot routine to write a reply draft in that conversation. This page never sends email, and it stores no secrets in the repo.

Current page version: `write-with-grok-version: 2026-11-14c`

## Install in Missive

1. In Missive, open **Settings → Integrations** and add a **Custom iFrame integration**.
2. Paste this page URL: `https://djhunterh28.github.io/missive-grok-draft/`
3. Open the integration in the right sidebar.
4. Paste the **Webhook URL** and the full **Authorization header** value from the routine’s panel in Grok Bot, then save. Do this once.
5. In a conversation or open draft, choose **Write with Grok** (or use the sidebar button). Optional instructions, such as “say yes but push to Tuesday,” are included in the request.
6. Review the draft when it appears (about a minute later) and press Send yourself.

After a page update, reopen the integration in Missive’s sidebar so it loads the new version. You do not need to re-paste the webhook URL or Authorization header unless you changed them.

## Why a CORS relay is required

Grok Bot routine webhooks only accept `Authorization: Bearer <key>` on an HTTP POST. Official docs do not describe a query parameter or body-field alternative, so a browser page cannot use a “simple request” to carry the key.

The webhook host (`api2.cursor.sh`) answers CORS preflight `OPTIONS` with `Access-Control-Allow-Headers: authorization, content-type`, but it does **not** send `Access-Control-Allow-Origin`. The browser therefore blocks the real POST. An earlier version of this page fell back to `mode: "no-cors"`, which silently dropped the Authorization header and then showed a false “Sent” status. That fallback is gone. Failures now show the HTTP status, or `blocked by browser (CORS)`, including a Missive alert from the context-menu action.

To actually reach the webhook from Missive, a tiny HTTPS relay must add the Authorization header server-side and return CORS headers that allow `https://djhunterh28.github.io`. The source for a Cloudflare Worker is in `relay/worker.js`. Deploying it needs a free Cloudflare account (or another host with serverless functions, such as Netlify). That account is not available from this repo’s existing tools, so the worker is not live yet.

Once a relay is deployed, paste its URL into **CORS relay URL** in the Missive sidebar settings and save. Leave the webhook URL and Authorization header as they are.
