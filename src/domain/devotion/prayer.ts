/** Prayer-time arithmetic. Input is the aladhan `timings` map; nothing here fetches. */

export type PrayerTimes = Record<string, string>; // e.g. { Fajr: "04:24", Dhuhr: "12:03", … }

export interface NextPrayer {
  name: string;
  time: string;
  countdown: string;          // "MM:SS"
  remainingMinutes: number;
  totalRemainingSeconds: number;
}

const ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function countdown(fromMs: number): Pick<NextPrayer, 'countdown' | 'remainingMinutes' | 'totalRemainingSeconds'> {
  const mins = Math.floor(fromMs / 60000);
  const secs = Math.floor((fromMs % 60000) / 1000);
  return {
    countdown: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
    remainingMinutes: mins,
    totalRemainingSeconds: Math.floor(fromMs / 1000),
  };
}

/**
 * The next prayer after `now`. Once Isha has passed, rolls to tomorrow's Fajr.
 * Returns `null` when no times are available (caller should leave state untouched).
 */
export function computeNextPrayer(times: PrayerTimes, now: Date = new Date()): NextPrayer | null {
  if (!times || Object.keys(times).length === 0) return null;

  for (const name of ORDER) {
    const timeStr = times[name];
    if (!timeStr) continue;
    const [h, m] = timeStr.split(':').map(Number);
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    if (at > now) {
      return { name, time: timeStr, ...countdown(at.getTime() - now.getTime()) };
    }
  }

  // everything today has passed → tomorrow's Fajr
  const timeStr = times['Fajr'];
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const at = new Date(now);
    at.setDate(at.getDate() + 1);
    at.setHours(h, m, 0, 0);
    return { name: 'Fajr', time: timeStr, ...countdown(at.getTime() - now.getTime()) };
  }
  return { name: 'Fajr', time: timeStr, countdown: '--:--', remainingMinutes: 999, totalRemainingSeconds: 0 };
}

/**
 * The "wind down for the night" window: from the real Isha adhan until the real
 * Fajr adhan the next morning. Falls back to 21:00 / 04:00 before times load.
 */
export function isSleepWindow(times: PrayerTimes | undefined, now: Date = new Date()): boolean {
  const [fajrH, fajrM] = (times?.Fajr || '04:00').split(':').map(Number);
  const fajr = new Date(now); fajr.setHours(fajrH, fajrM, 0, 0);

  const [ishaH, ishaM] = (times?.Isha || '21:00').split(':').map(Number);
  const isha = new Date(now); isha.setHours(ishaH, ishaM, 0, 0);

  return now >= isha || now < fajr;
}
