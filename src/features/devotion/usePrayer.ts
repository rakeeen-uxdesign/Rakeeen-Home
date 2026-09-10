import { useState, useEffect, useCallback } from 'react';
import { computeNextPrayer, type NextPrayer } from '@/domain/devotion/prayer';

export const usePrayer = () => {
  const [times, setTimes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('prayer_times');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [hijri, setHijri] = useState<string>(() => {
    return localStorage.getItem('prayer_hijri') || '';
  });
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);

  const fetchPrayerTimes = async () => {
    setLoading(true);
    try {
      const d = new Date();
      const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
      const response = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=31.0379&longitude=31.3815&method=5`);
      const data = await response.json();
      if (data.code === 200) {
        setTimes(data.data.timings);
        const h = data.data.date.hijri;
        const hStr = `${h.day} ${h.month.ar} ${h.year} هـ`;
        setHijri(hStr);
        localStorage.setItem('prayer_times', JSON.stringify(data.data.timings));
        localStorage.setItem('prayer_hijri', hStr);
      }
    } catch (error) {
      console.error('Failed to fetch prayer times', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNextPrayer = useCallback(() => {
    const next = computeNextPrayer(times, new Date());
    if (next) setNextPrayer(next);
  }, [times]);

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    updateNextPrayer();
    const timer = setInterval(updateNextPrayer, 1000);
    return () => clearInterval(timer);
  }, [updateNextPrayer]);

  return { times, nextPrayer, loading, hijri };
};
