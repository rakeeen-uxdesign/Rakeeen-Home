import { describe, it, expect } from 'vitest';
import { buildDailyBrief, type CalendarEventLike } from '@/domain/brief/dailyBrief';

const now = new Date('2026-09-10T09:00:00');

function ev(title: string, startH: number, endH: number): CalendarEventLike {
  const startDate = new Date(now); startDate.setHours(startH, 0, 0, 0);
  const endDate = new Date(now); endDate.setHours(endH, 0, 0, 0);
  return { title, startDate, endDate };
}

const baseInput = {
  greetingName: 'Hamed',
  now,
  events: [] as CalendarEventLike[],
  waterGlasses: 6,
  waterGoal: 12,
  focusMinutesToday: 60,
  focusTargetMinutes: 600,
  nextPrayer: null,
  subscriptionsDueToday: [],
  safeToSpend: 1240,
};

describe('buildDailyBrief', () => {
  it('greets by time of day', () => {
    expect(buildDailyBrief(baseInput).headline).toBe('Morning, Hamed.');
    expect(buildDailyBrief({ ...baseInput, now: new Date('2026-09-10T20:00:00') }).headline)
      .toBe('Evening, Hamed.');
  });

  it('calls out a wide-open day with no events', () => {
    const b = buildDailyBrief(baseInput);
    expect(b.lines).toContain('Nothing on the calendar — a wide-open day.');
    expect(b.freeMinutesToday).toBeGreaterThan(0);
  });

  it('finds the gap between two events and suggests a focus block', () => {
    const input = { ...baseInput, events: [ev('Clinic', 6, 10), ev('Meeting', 14, 16)] };
    const b = buildDailyBrief(input);
    // free: 10:00-14:00 (4h) + 16:00-23:59 (~8h) = a lot, definitely >= 60min
    expect(b.freeMinutesToday).toBeGreaterThanOrEqual(4 * 60);
    expect(b.lines.some(l => l.includes('open between events'))).toBe(true);
    expect(b.lines.some(l => l.startsWith('Next up: Meeting'))).toBe(true);
  });

  it('flags water when behind by 3+', () => {
    const b = buildDailyBrief({ ...baseInput, waterGlasses: 2, waterGoal: 12 });
    expect(b.lines.some(l => l.startsWith("Water's behind"))).toBe(true);
  });

  it('does not nag about water when on track', () => {
    const b = buildDailyBrief({ ...baseInput, waterGlasses: 10, waterGoal: 12 });
    expect(b.lines.some(l => l.startsWith("Water's behind"))).toBe(false);
  });

  it('reports remaining focus time, or says the target is hit', () => {
    const behind = buildDailyBrief({ ...baseInput, focusMinutesToday: 100, focusTargetMinutes: 600 });
    expect(behind.lines.some(l => l.includes('left to hit'))).toBe(true);

    const done = buildDailyBrief({ ...baseInput, focusMinutesToday: 650, focusTargetMinutes: 600 });
    expect(done.lines.some(l => l.includes('already hit'))).toBe(true);
  });

  it('lists subscriptions due today and always states safe-to-spend', () => {
    const b = buildDailyBrief({
      ...baseInput,
      subscriptionsDueToday: [{ name: 'Netflix', cost: 250 }],
    });
    expect(b.lines.some(l => l.includes('Netflix renews today'))).toBe(true);
    expect(b.lines.some(l => l.includes('Safe to spend this week: 1,240 EGP'))).toBe(true);
  });
});
