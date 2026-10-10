import { useEffect, useState } from 'react';
import type { GoldPrices } from '@/domain/finance/insights';

const CACHE_KEY = 'gold_prices_cache';
const EIGHT_HOURS = 8 * 60 * 60 * 1000;

const readCache = (): (GoldPrices & { lastUpdated?: number }) | null => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '');
    return cached?.price24 ? cached : null;
  } catch {
    return null;
  }
};

/**
 * Gold spot prices per gram in EGP. Starts from the cached copy so values show without
 * waiting; hits goldapi.io only when `refresh` is on and the cache is over 8 hours old
 * (the free plan is rate-limited).
 */
export function useGoldPrices(refresh: boolean): { prices: GoldPrices | null; loading: boolean } {
  const [prices, setPrices] = useState<GoldPrices | null>(() => {
    const cached = readCache();
    return cached ? { price24: cached.price24, price21: cached.price21 } : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!refresh) return;
    const cached = readCache();
    if (cached?.lastUpdated && Date.now() - cached.lastUpdated < EIGHT_HOURS) return;

    let cancelled = false;
    setLoading(true);
    fetch('https://www.goldapi.io/api/XAU/EGP', {
      headers: { 'x-access-token': import.meta.env.VITE_GOLD_API_KEY || '', 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
      .then((res) => { if (res.ok) return res.json(); throw new Error('api_error'); })
      .then((data) => {
        if (!data.price_gram_24k || !data.price_gram_21k) return;
        const fresh = { price24: Math.round(data.price_gram_24k), price21: Math.round(data.price_gram_21k) };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...fresh, lastUpdated: Date.now() }));
        if (!cancelled) setPrices(fresh);
      })
      .catch(() => { /* offline or rate-limited — keep the cached prices */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refresh]);

  return { prices, loading };
}
