import React, { useEffect, useRef } from 'react';
import { useFirebaseSync } from '@/data/useFirebaseSync';
import { usePrayer } from '@/data/usePrayer';
import { POMODORO_WEEKLY_MOCK } from '@/constants/mockData';

/**
 * Rolls the day over: archives water into history and zeroes today's count at
 * 18:00 (3h before the fixed 21:00 sleep schedule), and archives/zeroes focus
 * sessions at two triggers — real Isha adhan (snapshot today so-far) and real
 * midnight (merge the post-Isha leftover into that same day's history).
 *
 * Not calendar-related — it used to also cache "next sleep time" from a Google
 * Calendar feed for a since-removed Calendar page; that fetch is gone.
 */
export const DailyResetManager: React.FC = () => {
  // Guards against double-firing when Firebase hasn't confirmed lastResetDate yet
  const firedResetMarkerRef = useRef<string>('');
  const firedPomoIshaMarkerRef = useRef<string>('');
  const firedPomoMidnightMarkerRef = useRef<string>('');

  // Real Isha adhan time, refreshed daily from the prayer API — closes out "today"
  // for the focus/pomodoro reset at this exact moment.
  const { times: prayerTimes } = usePrayer();

  // Setters for resetting. Values are read fresh from localStorage inside the reset
  // functions (or via functional setState), so the raw values are intentionally not
  // destructured here — that keeps this component from re-running its effect on every
  // water sip / focus tick.
  const [, setGlasses, glassesReady] = useFirebaseSync<number>('hydration_glasses', 0);
  const [, setLog, logReady] = useFirebaseSync<any[]>('hydration_log', []);
  const [, setHistory, historyReady] = useFirebaseSync<Record<string, number>>('hydration_history', {});

  const [, setPomoSessions, pomoReady] = useFirebaseSync<number>('pomodoro_sessions', 0);
  const [, setPomoWeek, pomoWeekReady] = useFirebaseSync<any[]>('pomodoro_week', POMODORO_WEEKLY_MOCK);
  const [, setPomoHistory, pomoHistoryReady] = useFirebaseSync<Record<string, { sessions: number, minutes: number }>>('pomodoro_history', {});

  const [lastResetDate, setLastResetDate, lastResetDateReady] = useFirebaseSync<string>('system_last_reset_date', '');
  const [lastPomoIshaResetDate, setLastPomoIshaResetDate, lastPomoIshaResetDateReady] = useFirebaseSync<string>('system_last_pomo_reset_date', '');
  const [lastPomoMidnightResetDate, setLastPomoMidnightResetDate, lastPomoMidnightResetDateReady] = useFirebaseSync<string>('system_last_pomo_midnight_reset_date', '');

  useEffect(() => {
    // Wait until ALL Firebase sync hooks are ready before checking whether to reset
    if (
      !glassesReady ||
      !logReady ||
      !historyReady ||
      !pomoReady ||
      !pomoWeekReady ||
      !pomoHistoryReady ||
      !lastResetDateReady ||
      !lastPomoIshaResetDateReady ||
      !lastPomoMidnightResetDateReady
    ) {
      console.log('[DailyResetManager] Waiting for Firebase sync to be ready...');
      return;
    }

    const performReset = async (sleepDate: Date) => {
      // We calculate the logical "yesterday" relative to the sleep date
      const lastDateStr = new Date(sleepDate.getTime() - 12 * 60 * 60 * 1000).toDateString();

      console.log(`[DailyResetManager] Recording water history and resetting for: ${lastDateStr}`);

      // Read the freshest value straight from localStorage instead of React state,
      // which can lag behind what Water.tsx just wrote (a Firestore-listener state
      // update isn't guaranteed to have flushed yet), causing the archived tally to
      // be recorded as 0.
      const currentGlasses = (() => {
        try { return Number(JSON.parse(window.localStorage.getItem('hydration_glasses') || '0')) || 0; }
        catch { return 0; }
      })();

      if (currentGlasses > 0) {
        setHistory(prev => ({ ...(prev || {}), [lastDateStr]: currentGlasses }));
      }
      setGlasses(0);
      setLog([]);
    };

    // Which day a session belongs to always follows the real calendar date (midnight
    // boundary) — matches getPomoTodayIdx(). Isha is ONLY when the "save + zero the
    // counter" action fires, not when the day label changes. That means two separate
    // triggers are needed:
    //   1. At Isha: snapshot today's progress-so-far into history, then zero the
    //      counter so the rest of the evening (still the same calendar day) starts fresh.
    //   2. At midnight: whatever accumulated between Isha and midnight (today's leftover)
    //      gets merged into that same day's history entry, then the new day starts clean.
    const dayIdxOf = (d: Date) => (d.getDay() + 6) % 7; // Mon-Sun

    const readFreshPomoWeek = (): any[] => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem('pomodoro_week') || 'null');
        return Array.isArray(parsed) && parsed.length === 7 ? parsed : POMODORO_WEEKLY_MOCK;
      } catch { return POMODORO_WEEKLY_MOCK; }
    };

    const checkPomoReset = () => {
      const now = new Date();
      const todayDateStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();

      // --- Isha trigger: snapshot today's progress so far, then let today keep
      // accumulating from zero (falls back to 9:00 PM if prayer times haven't loaded) ---
      const [ishaH, ishaM] = (prayerTimes?.Isha || '21:00').split(':').map(Number);
      const todayIsha = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ishaH, ishaM, 0, 0);

      if (now >= todayIsha && lastPomoIshaResetDate !== todayDateStr && firedPomoIshaMarkerRef.current !== todayDateStr) {
        firedPomoIshaMarkerRef.current = todayDateStr;
        window.localStorage.setItem('system_last_pomo_reset_date', JSON.stringify(todayDateStr));
        window.localStorage.setItem('system_last_pomo_reset_date_updatedAt', new Date().toISOString());
        console.log(`[DailyResetManager] Isha snapshot for: ${todayDateStr}`);

        const todayIdx = dayIdxOf(now);
        const freshWeek = readFreshPomoWeek();
        const todayPomo = freshWeek[todayIdx] || { sessions: 0, minutes: 0 };

        if (todayPomo.sessions > 0) {
          setPomoHistory(prev => ({ ...(prev || {}), [todayDateStr]: { sessions: todayPomo.sessions, minutes: todayPomo.minutes } }));
        }
        setPomoSessions(0);
        setPomoWeek(freshWeek.map((d: any, i: number) => i === todayIdx ? { sessions: 0, minutes: 0 } : d));
        setLastPomoIshaResetDate(todayDateStr);
      }

      // --- Midnight trigger: merge yesterday's post-Isha leftover into its history
      // entry (once per calendar day — doesn't need to run exactly at midnight, just
      // before today's own Isha trigger would otherwise mix the two days together) ---
      if (lastPomoMidnightResetDate !== todayDateStr && firedPomoMidnightMarkerRef.current !== todayDateStr) {
        firedPomoMidnightMarkerRef.current = todayDateStr;
        window.localStorage.setItem('system_last_pomo_midnight_reset_date', JSON.stringify(todayDateStr));
        window.localStorage.setItem('system_last_pomo_midnight_reset_date_updatedAt', new Date().toISOString());

        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const yesterdayDateStr = yesterday.toDateString();
        const yesterdayIdx = dayIdxOf(yesterday);
        const todayIdx = dayIdxOf(now);

        const freshWeek = readFreshPomoWeek();
        const leftoverPomo = freshWeek[yesterdayIdx] || { sessions: 0, minutes: 0 };

        if (leftoverPomo.sessions > 0) {
          console.log(`[DailyResetManager] Merging post-Isha leftover into: ${yesterdayDateStr}`);
          setPomoHistory(prev => {
            const base = prev || {};
            const existing = base[yesterdayDateStr] || { sessions: 0, minutes: 0 };
            return {
              ...base,
              [yesterdayDateStr]: {
                sessions: existing.sessions + leftoverPomo.sessions,
                minutes: existing.minutes + leftoverPomo.minutes,
              },
            };
          });
        }
        setPomoSessions(0);

        // New week starts fresh once today is Saturday (idx 5)
        if (todayIdx === 5) {
          setPomoWeek(POMODORO_WEEKLY_MOCK);
        } else {
          setPomoWeek(freshWeek.map((d: any, i: number) =>
            (i === yesterdayIdx || i === todayIdx) ? { sessions: 0, minutes: 0 } : d
          ));
        }

        setLastPomoMidnightResetDate(todayDateStr);
      }
    };

    // Fixed schedule: sleep at 21:00 → reset trigger is 3h earlier, at 18:00.
    // Computed purely from the wall clock — no network fetch in the critical path,
    // so a page refresh can never race an in-flight request.
    const SLEEP_HOUR = 21;
    const RESET_HOUR = SLEEP_HOUR - 3; // 18:00

    const checkReset = () => {
      const now = new Date();
      // "Today's logical day" ends at RESET_HOUR. Before that time we're still
      // finishing yesterday's logical day; at/after it we've crossed into today's.
      const resetDateBase = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (now.getHours() < RESET_HOUR) {
        resetDateBase.setDate(resetDateBase.getDate() - 1);
      }
      const resetMarker = resetDateBase.toDateString();

      if (lastResetDate !== resetMarker && firedResetMarkerRef.current !== resetMarker) {
        firedResetMarkerRef.current = resetMarker;
        // Write value + updatedAt synchronously (mirrors useFirebaseSync's setValue) so a
        // refresh mid-reset sees the marker AND the Firestore listener won't clobber it
        // back with the stale server value once it connects.
        const nowIso = new Date().toISOString();
        window.localStorage.setItem('system_last_reset_date', JSON.stringify(resetMarker));
        window.localStorage.setItem('system_last_reset_date_updatedAt', nowIso);
        console.log(`[DailyResetManager] Triggering reset for logical day: ${resetMarker}`);
        const sleepMoment = new Date(resetDateBase);
        sleepMoment.setHours(SLEEP_HOUR, 0, 0, 0);
        performReset(sleepMoment);
        setLastResetDate(resetMarker);
      }
    };

    const runChecks = () => {
      checkReset();
      checkPomoReset();
    };

    const interval = setInterval(runChecks, 2 * 60 * 1000); // Check every 2 minutes
    runChecks();
    return () => clearInterval(interval);
  }, [
    lastResetDate, lastPomoIshaResetDate, lastPomoMidnightResetDate,
    setGlasses, setLog, setHistory, setLastResetDate, setLastPomoIshaResetDate, setLastPomoMidnightResetDate, setPomoSessions, setPomoWeek, setPomoHistory,
    glassesReady, logReady, historyReady, pomoReady, pomoWeekReady, pomoHistoryReady, lastResetDateReady, lastPomoIshaResetDateReady, lastPomoMidnightResetDateReady,
    prayerTimes
  ]);

  return null;
};
