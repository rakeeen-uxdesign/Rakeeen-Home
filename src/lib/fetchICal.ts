/**
 * Fetches a raw iCal (.ics) document from a URL the browser can't read directly
 * (Google Calendar sends no CORS headers). Google killed the old `corsproxy.io`
 * free tier, so this tries a chain of fallbacks:
 *
 *   1. A private proxy, if `VITE_ICAL_PROXY` is set — RECOMMENDED. Deploy the tiny
 *      Cloudflare Worker in `docs/ical-proxy-worker.js` (free, permanent) and set
 *      VITE_ICAL_PROXY to its URL. The target ics URL is passed as `?url=<encoded>`.
 *   2. Public CORS proxies (best-effort — they rate-limit and disappear).
 *
 * Throws if every strategy fails.
 */

const PRIVATE_PROXY = import.meta.env.VITE_ICAL_PROXY as string | undefined;

type Strategy = { url: string; extract: (res: Response) => Promise<string> };

const asText = (res: Response) => res.text();

async function fromAllOriginsGet(res: Response): Promise<string> {
  const json = await res.json();
  const contents: string = json?.contents ?? '';
  const m = contents.match(/^data:.*?;base64,(.*)$/s);
  if (m) return atob(m[1]);
  return contents;
}

function strategies(icalUrl: string): Strategy[] {
  const enc = encodeURIComponent(icalUrl);
  const list: Strategy[] = [];
  if (PRIVATE_PROXY) {
    const sep = PRIVATE_PROXY.includes('?') ? '&' : '?';
    list.push({ url: `${PRIVATE_PROXY}${sep}url=${enc}`, extract: asText });
  }
  list.push(
    { url: `https://api.allorigins.win/raw?url=${enc}`, extract: asText },
    { url: `https://api.codetabs.com/v1/proxy/?quest=${icalUrl}`, extract: asText },
    { url: `https://api.allorigins.win/get?url=${enc}`, extract: fromAllOriginsGet },
  );
  return list;
}

const looksLikeICal = (text: string) => text.includes('BEGIN:VCALENDAR') || text.includes('BEGIN:VEVENT');

export async function fetchICal(icalUrl: string): Promise<string> {
  let lastErr: unknown;
  for (const s of strategies(icalUrl)) {
    try {
      const res = await fetch(s.url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await s.extract(res);
      if (looksLikeICal(text)) return text;
      throw new Error('response was not an iCal document');
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Could not fetch calendar (all proxies failed): ${String(lastErr)}`);
}
