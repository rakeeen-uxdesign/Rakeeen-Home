import { describe, it, expect } from 'vitest';
import { breakMinutesFor, recordSession } from '@/domain/focus/session';

describe('breakMinutesFor — 20% of focus, min 1', () => {
  it('25 minutes → 5', () => expect(breakMinutesFor(25)).toBe(5));
  it('50 minutes → 10', () => expect(breakMinutesFor(50)).toBe(10));
  it('rounds: 35 → 7', () => expect(breakMinutesFor(35)).toBe(7));
  it('never below a minute', () => {
    expect(breakMinutesFor(3)).toBe(1);
    expect(breakMinutesFor(0)).toBe(1);
  });
});

describe('recordSession', () => {
  const week = [{ day: 'Mon', sessions: 1, minutes: 25 }, { day: 'Tue', sessions: 0 }];

  it('adds a session and its minutes to just that day', () => {
    const next = recordSession(week, 1, 40);
    expect(next[1]).toEqual({ day: 'Tue', sessions: 1, minutes: 40 });
    expect(next[0]).toBe(week[0]);
  });

  it('stacks on what the day already has, and never mutates the week', () => {
    expect(recordSession(week, 0, 10)[0]).toMatchObject({ sessions: 2, minutes: 35 });
    expect(week[0]).toEqual({ day: 'Mon', sessions: 1, minutes: 25 });
  });
});
