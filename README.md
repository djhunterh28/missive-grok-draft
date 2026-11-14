# Write with Grok (Missive integration)

A custom Missive UI/iFrame integration that adds a **Write with Grok** action in the draft window and conversation menu. Clicking it asks a Grok Bot routine to write a reply draft in that conversation. This page never sends email, and it stores no secrets in the repo.

## Install in Missive

1. In Missive, open **Settings → Integrations** and add a **Custom iFrame integration**.
2. Paste this page URL: `https://djhunterh28.github.io/missive-grok-draft/`
3. Open the integration in the right sidebar.
4. Paste the **Webhook URL** and the full **Authorization header** value from the routine’s panel in Grok Bot, then save. Do this once.
5. In a conversation or open draft, choose **Write with Grok** (or use the sidebar button). Optional instructions, such as “say yes but push to Tuesday,” are included in the request.
6. Review the draft when it appears (about a minute later) and press Send yourself.
