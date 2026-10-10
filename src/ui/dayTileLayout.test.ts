import { describe, it, expect } from 'vitest';
import { layoutDayTile } from '@/ui/dayTileLayout';
import { DM } from '@/ui/TimerComponents';

// Lit columns of each glyph, e.g. "1" lights columns 1–3 only.
const inkWidth = (d: string) => {
  const lit = DM[d].flatMap((row) => row.flatMap((on, c) => (on ? [c] : [])));
  return Math.max(...lit) - Math.min(...lit) + 1;
};

describe('layoutDayTile', () => {
  it('keeps the base tile when the lit width fits it symmetrically', () => {
    expect(layoutDayTile([3])).toEqual({ columns: 13, starts: [5] }); // "1"
    expect(layoutDayTile([4, 4])).toEqual({ columns: 13, starts: [2, 7] }); // e.g. "20"
  });

  it('adds a column instead of spreading the digits when the parity is wrong', () => {
    expect(layoutDayTile([3, 4])).toEqual({ columns: 14, starts: [3, 7] }); // "10"
    expect(layoutDayTile([4])).toEqual({ columns: 14, starts: [5] }); // "2"
  });

  it('always keeps one column between digits and equal inner margins, for every day', () => {
    for (let day = 1; day <= 31; day++) {
      const widths = [...String(day)].map(inkWidth);
      const { columns, starts } = layoutDayTile(widths);
      const last = widths.length - 1;
      expect(Number.isInteger(starts[0]), `day ${day}`).toBe(true);
      expect(starts[0], `day ${day}`).toBe(columns - (starts[last] + widths[last]));
      for (let i = 1; i < widths.length; i++) expect(starts[i] - (starts[i - 1] + widths[i - 1])).toBe(1);
    }
  });
});
