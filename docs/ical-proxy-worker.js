/**
 * Rakeeen — iCal CORS proxy (Cloudflare Worker)
 * ---------------------------------------------------------------------------
 * Google Calendar's private .ics URL sends no CORS headers, so the dashboard
 * (running on GitHub Pages) can't fetch it directly. This tiny Worker fetches
 * it server-side and re-serves it with `Access-Control-Allow-Origin: *`.
 *
 * DEPLOY (one time, ~3 min, free):
 *   1. Go to https://dash.cloudflare.com  →  Workers & Pages  →  Create  →  Worker
 *   2. Name it e.g. "rakeeen-ical" and click Deploy
 *   3. Click "Edit code", paste THIS file's contents over the template, Save & Deploy
 *   4. Copy the worker URL, e.g. https://rakeeen-ical.<you>.workers.dev
 *   5. In the repo, set the GitHub Actions secret / build env:
 *          VITE_ICAL_PROXY = https://rakeeen-ical.<you>.workers.dev
 *      (add it next to the other VITE_* secrets in .github/workflows/deploy.yml)
 *   6. Redeploy the site. Done — the calendar will pull events again.
 *
 * Locked to the one calendar host so it can't be abused as an open proxy.
 */

const ALLOWED_HOSTS = new Set(['calendar.google.com']);

export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const target = new URL(request.url).searchParams.get('url');
    if (!target) {
      return new Response('Missing ?url=', { status: 400, headers: cors });
    }

    let parsed;
    try {
      parsed = new URL(target);
    } catch {
      return new Response('Bad url', { status: 400, headers: cors });
    }
    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return new Response('Host not allowed', { status: 403, headers: cors });
    }

    const upstream = await fetch(target, {
      cf: { cacheTtl: 300, cacheEverything: true },
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};
