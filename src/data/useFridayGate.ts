import { useFirebaseSync } from '@/data/useFirebaseSync';
import { isFriday } from '@/domain/day';

/**
 * Friday is opt-in system-wide: by default nothing logged on a Friday counts
 * toward any history, streak, or generated line — the day is invisible to the
 * app unless Hamed explicitly chooses to include it via the Water page prompt.
 * The choice is per calendar date so it doesn't carry over to the next Friday.
 */
export function useFridayGate(now: Date = new Date()) {
  const [optIns, setOptIns] = useFirebaseSync<Record<string, true>>('friday_opt_in', {});
  const dateKey = now.toDateString();
  const friday = isFriday(now);
  const includedToday = !friday || !!optIns[dateKey];

  const includeToday = () => setOptIns(prev => ({ ...(prev || {}), [dateKey]: true }));

  return { friday, includedToday, includeToday };
}
