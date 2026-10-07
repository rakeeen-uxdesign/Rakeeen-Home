import { describe, it, expect } from 'vitest';
import { getDateParts } from '@/domain/month';

describe('getDateParts', () => {
  it('returns the day of the month and the month name', () => {
    expect(getDateParts(new Date('2026-10-07T12:00:00'))).toEqual({ day: 7, monthName: 'October' });
  });
  it('handles the first and last day of a year', () => {
    expect(getDateParts(new Date('2026-01-01T00:30:00'))).toEqual({ day: 1, monthName: 'January' });
    expect(getDateParts(new Date('2026-12-31T23:30:00'))).toEqual({ day: 31, monthName: 'December' });
  });
  it('names every month', () => {
    const names = Array.from({ length: 12 }, (_, m) => getDateParts(new Date(2026, m, 15)).monthName);
    expect(new Set(names).size).toBe(12);
  });
});
