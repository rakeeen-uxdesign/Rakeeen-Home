import { formatDurationText } from '@/lib/format';
import type { NextPrayer } from '@/domain/devotion/prayer';

export interface CalendarEventLike {
  title: string;
  startDate: Date;
  endDate: Date;
}

export interface DailyBriefInput {
  greetingName: string;
  now?: Date;
  events: CalendarEventLike[];        // today's plan (already filtered to today)
  waterGlasses: number;
  waterGoal: number;
  focusMinutesToday: number;
  focusTargetMinutes: number;         // e.g. 10h target = 600
  nextPrayer: NextPrayer | null;
  subscriptionsDueToday: { name: string; cost: number }[];
  safeToSpend: number;
}

export interface DailyBrief {
  headline: string;                              // "Morning, Hamed."
  freeMinutesToday: number;                       // gaps between events, for focus blocks
  lines: string[];                                // ready-to-render bullet lines
}

/**
 * Turns the day's raw numbers into something that *tells you what to do*,
 * not just what happened. This is the shape a morning push, an in-app
 * "Today" card, or a Discord message can all render — the decision about
 * *where* it's delivered is separate from what it says.
 */
export function buildDailyBrief(input: DailyBriefInput): DailyBrief {
  const now = input.now ?? new Date();
  const lines: string[] = [];

  const sorted = [...input.events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const freeMinutesToday = freeGapsMinutes(sorted, now);

  if (sorted.length === 0) {
    lines.push('Nothing on the calendar — a wide-open day.');
  } else {
    const next = sorted.find(e => e.startDate > now);
    if (next) {
      lines.push(`Next up: ${next.title} at ${formatClock(next.startDate)}.`);
    }
  }

  if (freeMinutesToday >= 60) {
    lines.push(`${formatDurationText(freeMinutesToday)} open between events — good for a focus block.`);
  }

  const waterBehind = input.waterGoal - input.waterGlasses;
  if (waterBehind >= 3) {
    lines.push(`Water's behind: ${input.waterGlasses}/${input.waterGoal} so far.`);
  }

  const focusRemaining = Math.max(0, input.focusTargetMinutes - input.focusMinutesToday);
  if (focusRemaining > 0) {
    lines.push(`${formatDurationText(focusRemaining)} left to hit today's focus target.`);
  } else if (input.focusTargetMinutes > 0) {
    lines.push(`Focus target already hit — ${formatDurationText(input.focusMinutesToday)} logged.`);
  }

  if (input.nextPrayer) {
    lines.push(`${input.nextPrayer.name} in ${input.nextPrayer.countdown}.`);
  }

  for (const sub of input.subscriptionsDueToday) {
    lines.push(`${sub.name} renews today — ${Math.round(sub.cost).toLocaleString('en-EG')} EGP.`);
  }

  lines.push(`Safe to spend this week: ${Math.round(input.safeToSpend).toLocaleString('en-EG')} EGP.`);

  return {
    headline: `${partOfDayGreeting(now)}, ${input.greetingName}.`,
    freeMinutesToday,
    lines,
  };
}

/** Minutes left today that aren't inside a calendar event, from `now` to end of day. */
function freeGapsMinutes(sortedEvents: CalendarEventLike[], now: Date): number {
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  let cursor = now;
  let free = 0;
  for (const ev of sortedEvents) {
    if (ev.endDate <= cursor) continue;                 // already past
    const gapStart = cursor;
    const gapEnd = ev.startDate > cursor ? ev.startDate : cursor;
    if (gapEnd > gapStart) free += (gapEnd.getTime() - gapStart.getTime()) / 60000;
    cursor = ev.endDate > cursor ? ev.endDate : cursor;
  }
  if (endOfDay > cursor) free += (endOfDay.getTime() - cursor.getTime()) / 60000;
  return Math.round(free);
}

function partOfDayGreeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
