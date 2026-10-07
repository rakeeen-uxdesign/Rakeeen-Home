import { describe, it, expect } from 'vitest';
import { getClockParts } from '@/domain/clock';

describe('getClockParts', () => {
  // 2026-10-07 12:00 UTC
  const noonUtc = new Date('2026-10-07T12:00:00Z');

  it('reads the same instant in different zones', () => {
    expect(getClockParts('UTC', noonUtc)).toEqual({ hour: '12', minute: '00', period: 'PM' });
    expect(getClockParts('Asia/Dubai', noonUtc)).toEqual({ hour: '4', minute: '00', period: 'PM' });
  });

  it('uses a 12-hour clock with AM/PM and a zero-padded minute', () => {
    expect(getClockParts('UTC', new Date('2026-10-07T00:05:00Z'))).toEqual({ hour: '12', minute: '05', period: 'AM' });
  });
});
