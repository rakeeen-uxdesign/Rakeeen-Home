import { describe, it, expect } from 'vitest';
import { formatTime, formatDurationText } from '@/lib/format';

describe('formatTime', () => {
  it('pads under 100 minutes', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(25 * 60)).toBe('25:00');
  });
  it('lets minutes grow past 99', () => {
    expect(formatTime(100 * 60 + 7)).toBe('100:07');
  });
});

describe('formatDurationText', () => {
  it('minutes only under an hour', () => {
    expect(formatDurationText(45)).toBe('45m');
    expect(formatDurationText(0)).toBe('0m');
  });
  it('hours + minutes', () => {
    expect(formatDurationText(90)).toBe('1h 30m');
    expect(formatDurationText(135)).toBe('2h 15m');
  });
  it('whole hours drop the minutes', () => {
    expect(formatDurationText(120)).toBe('2h');
  });
  it('rounds and floors negatives to zero', () => {
    expect(formatDurationText(59.6)).toBe('1h');
    expect(formatDurationText(-5)).toBe('0m');
  });
});
