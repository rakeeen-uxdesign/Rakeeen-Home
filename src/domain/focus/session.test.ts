import { describe, it, expect } from 'vitest';
import { breakMinutesFor } from '@/domain/focus/session';

describe('breakMinutesFor — 20% of focus, min 1', () => {
  it('25 minutes → 5', () => expect(breakMinutesFor(25)).toBe(5));
  it('50 minutes → 10', () => expect(breakMinutesFor(50)).toBe(10));
  it('rounds: 35 → 7', () => expect(breakMinutesFor(35)).toBe(7));
  it('never below a minute', () => {
    expect(breakMinutesFor(3)).toBe(1);
    expect(breakMinutesFor(0)).toBe(1);
  });
});
