import React from 'react';
import { DM } from '@/ui/TimerComponents';

// Same cells and tones as the pixel clocks' face, as a square: a rim ring around
// an 11×11 inside, with the 5-row day number in the exact middle.
const SIDE = 13;
const FACE = 'color-mix(in srgb, var(--ink) 16%, var(--paper))';
const RIM = 'color-mix(in srgb, var(--ink) 38%, var(--paper))';
const CELL = 10;
const GAP = 1;
const STEP = CELL + GAP;
const EXTENT = SIDE * STEP - GAP;
const DAY_ROW = Math.floor((SIDE - 5) / 2);

/**
 * Today's date: a pixel tile with the day number in the middle, in the Focus
 * dot-matrix font and green on the same face as the clocks, and the month's
 * name beneath it, outside the square, in small plain type.
 */
export const PixelDateTile: React.FC<{ date: { day: number; monthName: string }; width?: string }> = ({ date, width = '84px' }) => {
  const digits = [...String(date.day)];
  // Each digit is 4 columns wide, with 1 column between digits.
  const digitsWidth = digits.length * 5 - 1;
  const dayCol = (SIDE - digitsWidth) / 2;

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < SIDE; r++) {
    for (let c = 0; c < SIDE; c++) {
      const isRim = r === 0 || c === 0 || r === SIDE - 1 || c === SIDE - 1;
      cells.push(<rect key={`${r},${c}`} x={c * STEP} y={r * STEP} width={CELL} height={CELL} fill={isRim ? RIM : FACE} />);
    }
  }
  digits.forEach((d, i) => {
    (DM[d] ?? DM['0']).forEach((row, r) =>
      row.forEach((on, c) => {
        if (!on) return;
        cells.push(
          <rect
            key={`d${i}-${r}-${c}`}
            x={(dayCol + i * 5 + c) * STEP} y={(DAY_ROW + r) * STEP}
            width={CELL} height={CELL} fill="var(--pomo-focus)"
          />
        );
      })
    );
  });

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width }}>
      <svg viewBox={`0 0 ${EXTENT} ${EXTENT}`} style={{ width: '100%', height: 'auto' }}>{cells}</svg>
      <span className="font-mono-main text-[10px] font-normal text-ink/60 leading-none">{date.monthName}</span>
    </div>
  );
};
