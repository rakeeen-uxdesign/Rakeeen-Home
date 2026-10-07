import { getDayMoments, type PrayerTimes } from '@/domain/devotion/prayer';

/** Hijri calendar date as the prayer API reports it. */
export interface HijriDate { day: number; month: number }

const MIN = 60_000;

/**
 * Minutes to show for a countdown: rounded UP to the next 5 so the header doesn't re-fade
 * every minute, then exact for the final five.
 */
const minutesLeft = (ms: number) => {
  const minutes = Math.ceil(ms / MIN);
  return minutes <= 5 ? minutes : Math.ceil(minutes / 5) * 5;
};

/**
 * A time-specific line for the header, or null when nothing special is going on.
 * Everything is measured against today's REAL prayer times (and the hijri date), so
 * it moves with the seasons. Lines end with a trailing space — the greeting appends
 * the name straight after.
 *
 * Priority: Eid / Arafah → Ramadan (suhoor, iftar, taraweeh, last ten) → Friday
 * (before Jumu'ah, the last hour before Maghrib for dua) → a prayer ≤15 min away → sunrise adhkar →
 * white days → Duha.
 */
export function getOccasionLine(
  times: PrayerTimes | undefined,
  hijri: HijriDate | null,
  now: Date = new Date(),
): string | null {
  const { fajr, sunrise, dhuhr, asr, maghrib, isha } = getDayMoments(times, now);
  const t = now.getTime();
  const isFriday = now.getDay() === 5;
  const month = hijri?.month;
  const day = hijri?.day ?? 0;

  // Festivals — all day.
  if (month === 10 && day >= 1 && day <= 3) return 'EID MUBARAK ... MAY IT BE BLESSED ';
  if (month === 12 && day === 9) return 'DAY OF ARAFAH ... FAST AND MAKE DUA ';
  if (month === 12 && day >= 10 && day <= 13) return 'EID AL-ADHA MUBARAK ... ';

  // Ramadan.
  if (month === 9) {
    if (t >= fajr - 45 * MIN && t < fajr) return 'SUHOOR WINDOW ... EAT BEFORE FAJR ';
    if (t >= maghrib - 45 * MIN && t < maghrib) return `IFTAR IN ${minutesLeft(maghrib - t)} MIN ... HOLD ON `;
    if (t >= maghrib && t < maghrib + 30 * MIN) return 'BISMILLAH ... IFTAR TIME ';
    if (t >= isha && t < isha + 90 * MIN) return 'TARAWEEH TIME ... STAND FOR THE NIGHT ';
    if (day >= 21 && t >= isha + 90 * MIN) return 'THE LAST TEN NIGHTS ... SEEK LAYLAT AL-QADR ';
  }

  // Friday.
  if (isFriday) {
    if (t >= dhuhr - 60 * MIN && t < dhuhr) return `JUMU'AH IN ${minutesLeft(dhuhr - t)} MIN ... GHUSL, PERFUME, GO EARLY `;
    if (t >= maghrib - 60 * MIN && t < maghrib) return 'THE HOUR OF DUA ... ASK BEFORE MAGHRIB ';
  }

  // A prayer is close.
  for (const [name, when] of [['DHUHR', dhuhr], ['ASR', asr], ['MAGHRIB', maghrib], ['ISHA', isha]] as const) {
    if (name === 'DHUHR' && isFriday) continue; // Jumu'ah line owns that window
    if (t >= when - 15 * MIN && t < when) return `${name} IN ${minutesLeft(when - t)} MIN ... WRAP WHAT'S IN YOUR HAND `;
  }

  // Just after sunrise.
  if (t >= sunrise && t < sunrise + 20 * MIN) return 'SUNRISE ... MORNING ADHKAR BEFORE ANYTHING ';
  if (t >= sunrise + 20 * MIN && t < dhuhr - 60 * MIN) {
    if (day >= 13 && day <= 15 && month !== 9) return 'WHITE DAYS ... FAST IF YOU CAN ';
    if (t < sunrise + 100 * MIN) return 'DUHA IS OPEN ... TWO RAKAHS ';
  }
  return null;
}
