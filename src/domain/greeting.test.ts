import { describe, it, expect } from 'vitest';
import { daysSinceActive, getAbsenceLine, getLiveFocusLine, getProgressLine, getWeatherLine, pickGreetingLine, type GreetingInputs } from '@/domain/greeting';

describe('daysSinceActive', () => {
  const h = {
    '2026-09-05': { water: 6, focus: 0, workout: 0 },
    '2026-09-06': { water: 0, focus: 0, workout: 0 },
  };
  it('counts from the latest active day before today', () => {
    expect(daysSinceActive(h, '2026-09-09')).toBe(4);
  });
  it('ignores today and empty days, null when nothing was ever logged', () => {
    expect(daysSinceActive({ '2026-09-09': { water: 3, focus: 0, workout: 0 } }, '2026-09-09')).toBeNull();
    expect(daysSinceActive({}, '2026-09-09')).toBeNull();
  });
});

describe('getAbsenceLine', () => {
  it('only after a 2+ day gap and only while today is empty', () => {
    expect(getAbsenceLine(3, true)).toBe('BACK AFTER 3 DAYS ... EASE BACK IN ');
    expect(getAbsenceLine(1, true)).toBeNull();
    expect(getAbsenceLine(3, false)).toBeNull();
    expect(getAbsenceLine(null, true)).toBeNull();
  });
});

describe('getProgressLine', () => {
  it('praises real numbers', () => {
    expect(getProgressLine(12, 0, 'push')).toContain('ALL 12 GLASSES');
    expect(getProgressLine(2, 135, 'push')).toBe('2H OF FOCUS TODAY ... KEEP GOING ');
    expect(getProgressLine(8, 0, 'hunting')).toContain('8 GLASSES');
    expect(getProgressLine(8, 0, 'birdsHome')).toBeNull();
    expect(getProgressLine(3, 20, 'push')).toBeNull();
  });
});

describe('getWeatherLine', () => {
  it('daytime and notable only', () => {
    expect(getWeatherLine({ temp: 40, code: 0 }, 'midday')).toBe('40° OUT THERE ... DRINK MORE WATER ');
    expect(getWeatherLine({ temp: 20, code: 61 }, 'push')).toContain('RAIN');
    expect(getWeatherLine({ temp: 9, code: 0 }, 'morning')).toContain('LAYER UP');
    expect(getWeatherLine({ temp: 25, code: 0 }, 'midday')).toBeNull();
    expect(getWeatherLine({ temp: 40, code: 0 }, 'night')).toBeNull();
    expect(getWeatherLine(null, 'midday')).toBeNull();
  });
});

describe('getLiveFocusLine', () => {
  it('stays quiet at the very start and when nothing is running', () => {
    expect(getLiveFocusLine({ elapsedMin: 0, remainingMin: 25, savedTodayMin: 0 })).toBeNull();
    expect(getLiveFocusLine({ elapsedMin: 4, remainingMin: 21, savedTodayMin: 0 })).toBeNull();
  });
  it('notices the session as it grows, in 30-minute steps', () => {
    expect(getLiveFocusLine({ elapsedMin: 12, remainingMin: 38, savedTodayMin: 0 })).toContain('IN THE ZONE');
    expect(getLiveFocusLine({ elapsedMin: 34, remainingMin: 26, savedTodayMin: 0 })).toBe('30 MIN IN ... STAY WITH IT ');
    expect(getLiveFocusLine({ elapsedMin: 61, remainingMin: 29, savedTodayMin: 0 })).toBe('60 MIN IN ... STAY WITH IT ');
  });
  it('counts the live session on top of what is already saved today', () => {
    expect(getLiveFocusLine({ elapsedMin: 40, remainingMin: 20, savedTodayMin: 85 })).toBe('2H OF FOCUS TODAY ... KEEP GOING ');
    expect(getLiveFocusLine({ elapsedMin: 100, remainingMin: 0, savedTodayMin: 80 })).toBe('3H OF FOCUS TODAY ... KEEP GOING ');
  });
  it('knows how long is left', () => {
    expect(getLiveFocusLine({ elapsedMin: 21, remainingMin: 3.2, savedTodayMin: 0 })).toBe('4 MIN LEFT ... FINISH STRONG ');
  });
});

describe('pickGreetingLine', () => {
  const quiet: GreetingInputs = {
    phase: 'push', liveFocus: null, prayerImminent: false, occasion: null, isSleepTime: false,
    absence: null, weekPattern: 'neutral', weather: null, progress: null,
    glasses: 5, focusMinutes: 30, focusRunning: false, isFriday: false, now: new Date('2026-10-07T14:00:00'),
  };
  const pick = (over: Partial<GreetingInputs>) => pickGreetingLine({ ...quiet, ...over });

  it('falls back to the phrase for this part of the day', () => {
    expect(pick({})).toBe("PUSH WHILE THE SUN'S STILL UP ... ");
    expect(pick({ phase: 'deepNight' })).toBe('DEEP NIGHT ... REST WELL ');
  });

  it('a running focus session beats an occasion, unless a prayer is minutes away', () => {
    expect(pick({ liveFocus: 'LIVE ', occasion: 'OCC ' })).toBe('LIVE ');
    expect(pick({ liveFocus: 'LIVE ', occasion: 'OCC ', prayerImminent: true })).toBe('OCC ');
  });

  it('follows the documented priority order', () => {
    expect(pick({ occasion: 'OCC ', isSleepTime: true })).toBe('OCC ');
    expect(pick({ isSleepTime: true, absence: 'ABS ' })).toMatch(/ISHA|OWLS|FAJR|SLEEP/);
    expect(pick({ absence: 'ABS ', weather: 'WX ' })).toBe('ABS ');
    expect(pick({ weather: 'WX ', progress: 'PROG ' })).toBe('WX ');
    expect(pick({ progress: 'PROG ', glasses: 1 })).toBe('PROG ');
  });

  it('nudges about low water and no focus only in the right phases', () => {
    expect(pick({ glasses: 1, focusMinutes: 30 })).toBe('RIVER IS LOW TODAY ... DRINK UP ');
    expect(pick({ glasses: 1, phase: 'morning', focusMinutes: 30 })).toBe('MORNING LOCKED IN ... BUILD IT ');
    expect(pick({ focusMinutes: 0 })).toBe("HAWK HASN'T MOVED YET ... ");
    expect(pick({ focusMinutes: 0, focusRunning: true })).toBe("PUSH WHILE THE SUN'S STILL UP ... ");
  });

  it('the week\'s trend only frames the morning and never buries the rest of the day', () => {
    expect(pick({ phase: 'morning', weekPattern: 'rising' })).toBe("SOMETHING IS SHIFTING ... DON'T STOP NOW ");
    expect(pick({ phase: 'hunting', weekPattern: 'fading' })).toBe('HAWK HAS BEEN DRIFTING ... COME BACK ');
    expect(pick({ phase: 'push', weekPattern: 'rising' })).toBe("PUSH WHILE THE SUN'S STILL UP ... ");
    expect(pick({ phase: 'night', weekPattern: 'slump' })).toBe('NIGHT SETTLED ... REST WELL ');
  });

  it('the trend yields to anything more specific', () => {
    expect(pick({ phase: 'morning', weekPattern: 'rising', progress: 'PROG ' })).toBe('PROG ');
    expect(pick({ phase: 'morning', weekPattern: 'rising', isFriday: true })).toBe("JUMU'AH MUBARAK ... READ YOUR KAHF ");
  });

  it('Friday outranks the plain phrase', () => {
    expect(pick({ isFriday: true })).toBe("JUMU'AH MUBARAK ... READ YOUR KAHF ");
  });
});
