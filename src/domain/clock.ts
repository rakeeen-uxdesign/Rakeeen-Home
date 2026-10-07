/** The zone the Home dock's Time card reads in — home. */
export const HOME_TIME_ZONE = 'Africa/Cairo';

export interface ClockParts {
  /** "5" — no leading zero, 12-hour */
  hour: string;
  /** "07" */
  minute: string;
  /** "AM" | "PM" */
  period: string;
}

/** 12-hour time in `timeZone`, split into parts so the digits can be drawn dotted. */
export function getClockParts(timeZone: string, now: Date = new Date()): ClockParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { hour: part('hour'), minute: part('minute'), period: part('dayPeriod') };
}
