import { describe, it, expect } from 'vitest';
import { computeNextPrayer, isSleepWindow } from '@/domain/devotion/prayer';

const times = { Fajr: '04:24', Dhuhr: '12:03', Asr: '15:36', Maghrib: '18:30', Isha: '19:52' };

describe('computeNextPrayer', () => {
  it('null when there are no times', () => {
    expect(computeNextPrayer({}, new Date())).toBeNull();
  });

  it('picks the next prayer later today', () => {
    const np = computeNextPrayer(times, new Date('2026-09-10T13:00:00'));
    expect(np?.name).toBe('Asr');
    expect(np?.time).toBe('15:36');
  });

  it('counts down in MM:SS', () => {
    const np = computeNextPrayer(times, new Date('2026-09-10T15:00:00'));
    expect(np?.name).toBe('Asr');
    expect(np?.countdown).toBe('36:00');
    expect(np?.remainingMinutes).toBe(36);
  });

  it('after Isha, rolls to tomorrow\'s Fajr', () => {
    const np = computeNextPrayer(times, new Date('2026-09-10T21:00:00'));
    expect(np?.name).toBe('Fajr');
    expect(np?.remainingMinutes).toBeGreaterThan(6 * 60); // ~7h24m away
  });
});

describe('isSleepWindow — Isha … Fajr', () => {
  it('true just after Isha', () => {
    expect(isSleepWindow(times, new Date('2026-09-10T20:30:00'))).toBe(true);
  });
  it('true in the small hours', () => {
    expect(isSleepWindow(times, new Date('2026-09-10T03:00:00'))).toBe(true);
  });
  it('false during the day', () => {
    expect(isSleepWindow(times, new Date('2026-09-10T14:00:00'))).toBe(false);
  });
  it('falls back to 21:00 / 04:00 with no times', () => {
    expect(isSleepWindow(undefined, new Date('2026-09-10T22:00:00'))).toBe(true);
    expect(isSleepWindow(undefined, new Date('2026-09-10T10:00:00'))).toBe(false);
  });
});
