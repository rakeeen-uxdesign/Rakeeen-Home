import { useEffect, useState } from 'react';
import { usePrayer } from '@/features/devotion/usePrayer';
import { isSleepWindow } from '@/domain/devotion/prayer';

/** True from the real Isha adhan until the next Fajr (see `isSleepWindow`). */
export function useSleepLock(): boolean {
  const { times } = usePrayer();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  return isSleepWindow(times, now);
}
