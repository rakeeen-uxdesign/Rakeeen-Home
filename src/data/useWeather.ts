import { useEffect, useState } from 'react';
import type { Weather } from '@/domain/greeting';

const CACHE_KEY = 'weather_cache';
const REFRESH_MS = 30 * 60_000;
// Same location the prayer times use.
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=31.0379&longitude=31.3815&current=temperature_2m,weather_code';

const readCache = (): { w: Weather; at: number } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Current temperature + WMO weather code (Open-Meteo, no key). Cached 30 min; null until known. */
export function useWeather(): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(() => readCache()?.w ?? null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const cached = readCache();
      if (cached && Date.now() - cached.at < REFRESH_MS) return;
      try {
        const res = await fetch(WEATHER_URL);
        const data = await res.json();
        const w = { temp: Number(data.current?.temperature_2m), code: Number(data.current?.weather_code) };
        if (!Number.isFinite(w.temp) || !Number.isFinite(w.code)) return;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ w, at: Date.now() }));
        if (!cancelled) setWeather(w);
      } catch {
        /* offline — keep whatever we had */
      }
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return weather;
}
