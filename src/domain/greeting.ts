import type { DayPhase } from '@/domain/devotion/prayer';

export interface DayTotals { water: number; focus: number; workout: number }

/** Whole days since the most recent day (before `todayKey`) with any logged activity; null if there is none. */
export function daysSinceActive(history: Record<string, DayTotals>, todayKey: string): number | null {
  let latest: string | null = null;
  for (const [key, d] of Object.entries(history)) {
    if (key >= todayKey) continue;
    if ((d?.water || 0) + (d?.focus || 0) + (d?.workout || 0) <= 0) continue;
    if (!latest || key > latest) latest = key;
  }
  if (!latest) return null;
  return Math.round((Date.parse(todayKey) - Date.parse(latest)) / 86_400_000);
}

/** Welcome-back line after a gap, only while today is still empty. */
export function getAbsenceLine(daysAway: number | null, todayEmpty: boolean): string | null {
  if (!todayEmpty || daysAway === null || daysAway < 2) return null;
  return `BACK AFTER ${daysAway} DAYS ... EASE BACK IN `;
}

const DAYTIME: DayPhase[] = ['morning', 'hunting', 'midday', 'push', 'birdsHome'];
/** Phases in which a low glass count is worth a nudge (water closes at Maghrib). */
const WATER_NUDGE_PHASES: DayPhase[] = ['hunting', 'midday', 'push', 'birdsHome'];
/** The week's-trend lines are a morning framing, not something to repeat all day. */
const TREND_PHASES: DayPhase[] = ['fajrHour', 'morning', 'hunting'];
/** Early enough in the day that "still early" is true — before the afternoon push. */
const EARLY_DAY: DayPhase[] = ['morning', 'hunting', 'midday', 'push'];

/** Lines that quote today's real numbers back — only when there's something worth praising. */
export function getProgressLine(glasses: number, focusMinutes: number, phase: DayPhase): string | null {
  if (glasses >= 12) return 'ALL 12 GLASSES ... THE RIVER IS FULL ';
  if (focusMinutes >= 120) return `${Math.floor(focusMinutes / 60)}H OF FOCUS TODAY ... KEEP GOING `;
  if (glasses >= 8 && EARLY_DAY.includes(phase)) return `${glasses} GLASSES AND IT'S STILL EARLY ... STRONG `;
  return null;
}

export interface Weather { temp: number; code: number }

/** WMO codes that mean rain / drizzle / showers / thunderstorm. */
const WET = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

/** A weather remark, daytime only, and only when the weather is actually notable. */
export function getWeatherLine(w: Weather | null, phase: DayPhase): string | null {
  if (!w || !DAYTIME.includes(phase)) return null;
  if (WET.has(w.code)) return 'RAIN OUTSIDE ... GOOD DAY TO STAY IN AND FOCUS ';
  if (w.temp >= 38) return `${Math.round(w.temp)}° OUT THERE ... DRINK MORE WATER `;
  if (w.temp <= 12) return `${Math.round(w.temp)}° OUT THERE ... LAYER UP `;
  return null;
}

export interface LiveFocus {
  /** Minutes of the CURRENT focus session so far (overtime included); 0 when none is in progress. */
  elapsedMin: number;
  /** Minutes left on the session's goal; 0 once in overtime. */
  remainingMin: number;
  /** Minutes already banked today from finished sessions. */
  savedTodayMin: number;
}

/**
 * Lines about a focus session WHILE it runs — no need to press Done. Totals count the
 * live session on top of what's already saved today. Returns null when nothing is in
 * progress or it's too early to say anything.
 */
export function getLiveFocusLine({ elapsedMin, remainingMin, savedTodayMin }: LiveFocus): string | null {
  if (elapsedMin < 1) return null;
  const todayMin = savedTodayMin + elapsedMin;
  if (remainingMin > 0 && remainingMin <= 5) return `${Math.ceil(remainingMin)} MIN LEFT ... FINISH STRONG `;
  if (todayMin >= 120) return `${Math.floor(todayMin / 60)}H OF FOCUS TODAY ... KEEP GOING `;
  if (elapsedMin >= 30) return `${Math.floor(elapsedMin / 30) * 30} MIN IN ... STAY WITH IT `;
  if (elapsedMin >= 10) return 'IN THE ZONE ... NO TABS, NO PHONE ';
  return null;
}

const SLEEP_TEASE_LINES = [
  "IT'S PAST ISHA ... WHAT ARE YOU STILL DOING HERE ",
  'THE OWLS ARE JUDGING YOU RIGHT NOW ',
  "THIS ISN'T FAJR, GO TO SLEEP ",
  'SLEEP IS FREE, TRY IT SOMETIME ',
];

const WEEK_PATTERN_LINES: Record<string, string> = {
  momentum: 'THREE DAYS LOCKED IN ... KEEP THE RIVER MOVING ',
  slump: 'THE RIVER HAS BEEN LOW ALL WEEK ... ',
  rising: "SOMETHING IS SHIFTING ... DON'T STOP NOW ",
  fading: 'HAWK HAS BEEN DRIFTING ... COME BACK ',
};

const PHASE_LINES: Record<DayPhase, string> = {
  deepNight: 'DEEP NIGHT ... REST WELL ',
  fajrHour: 'FAJR HOUR ... THE BEST START ',
  morning: 'MORNING LOCKED IN ... BUILD IT ',
  hunting: 'THE LION IS HUNTING ... KEEP MOVING ',
  midday: 'BEES BEEN OUT FOR HOURS ... YOUR TURN ',
  push: "PUSH WHILE THE SUN'S STILL UP ... ",
  birdsHome: 'BIRDS HEADING HOME ... WRAP IT UP ',
  goldenHour: 'GOLDEN HOUR ... CATCH THE LIGHT ',
  ishaNear: 'ISHA IS NEAR ... WIND DOWN ',
  night: 'NIGHT SETTLED ... REST WELL ',
};

export interface GreetingInputs {
  phase: DayPhase;
  /** From `getLiveFocusLine` — a focus session is running. */
  liveFocus: string | null;
  /** A prayer is minutes away; it outranks the live focus line. */
  prayerImminent: boolean;
  /** From `getOccasionLine`. */
  occasion: string | null;
  isSleepTime: boolean;
  absence: string | null;
  weekPattern: string;
  weather: string | null;
  progress: string | null;
  glasses: number;
  focusMinutes: number;
  focusRunning: boolean;
  isFriday: boolean;
  now: Date;
}

/**
 * The header line, most notable condition first: a running focus session, a prayer or
 * occasion, the sleep tease, a return after absence, weather, real numbers, then the nudges
 * (low water, no focus), Friday, the week's trend (mornings only, so it never buries
 * the rest of the day), and finally the plain phrase for this part of the day.
 */
export function pickGreetingLine(g: GreetingInputs): string {
  const waterLow = g.glasses < 3 && WATER_NUDGE_PHASES.includes(g.phase);
  const noFocus = g.focusMinutes === 0 && !g.focusRunning &&
    (g.phase === 'push' || g.phase === 'birdsHome' || g.phase === 'goldenHour');

  if (g.liveFocus && !g.prayerImminent) return g.liveFocus;
  if (g.occasion) return g.occasion;
  if (g.isSleepTime) return SLEEP_TEASE_LINES[Math.floor(g.now.getMinutes() / 15) % SLEEP_TEASE_LINES.length];
  if (g.absence) return g.absence;
  if (g.weather) return g.weather;
  if (g.progress) return g.progress;
  if (waterLow) return 'RIVER IS LOW TODAY ... DRINK UP ';
  if (noFocus) return "HAWK HASN'T MOVED YET ... ";
  if (g.isFriday) return "JUMU'AH MUBARAK ... READ YOUR KAHF ";
  if (TREND_PHASES.includes(g.phase) && WEEK_PATTERN_LINES[g.weekPattern]) return WEEK_PATTERN_LINES[g.weekPattern];
  return PHASE_LINES[g.phase];
}
