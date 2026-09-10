import { describe, it, expect } from 'vitest';
import { getLogicalDate, getTodayIdx, getPomoTodayIdx, getPomoLogicalDate } from '@/domain/day';

// A Wednesday: 2026-09-09
const wedMorning = new Date('2026-09-09T09:00:00');
const wedLateNight = new Date('2026-09-10T02:30:00'); // 2:30am Thu — still "Wed" logically
const wedFourAM = new Date('2026-09-10T04:00:00');    // exactly 04:00 Thu — now "Thu"
const sunday = new Date('2026-09-13T12:00:00');

describe('getLogicalDate', () => {
  it('after 04:00 is the same calendar day', () => {
    expect(getLogicalDate(wedMorning).toDateString()).toBe('Wed Sep 09 2026');
  });
  it('before 04:00 rolls back to the previous day', () => {
    expect(getLogicalDate(wedLateNight).toDateString()).toBe('Wed Sep 09 2026');
  });
  it('04:00 sharp is the new day', () => {
    expect(getLogicalDate(wedFourAM).toDateString()).toBe('Thu Sep 10 2026');
  });
});

describe('getTodayIdx (Mon=0 … Sun=6)', () => {
  it('Wednesday morning → 2', () => {
    expect(getTodayIdx(wedMorning)).toBe(2);
  });
  it('2:30am Thursday is still logically Wednesday → 2', () => {
    expect(getTodayIdx(wedLateNight)).toBe(2);
  });
  it('Sunday → 6', () => {
    expect(getTodayIdx(sunday)).toBe(6);
  });
});

describe('getPomoTodayIdx — real calendar day, no rollback', () => {
  it('2:30am Thursday is Thursday → 3', () => {
    expect(getPomoTodayIdx(wedLateNight)).toBe(3);
  });
  it('Sunday → 6', () => {
    expect(getPomoTodayIdx(sunday)).toBe(6);
  });
  it('getPomoLogicalDate just echoes the moment', () => {
    expect(getPomoLogicalDate(wedMorning).getTime()).toBe(wedMorning.getTime());
  });
});
