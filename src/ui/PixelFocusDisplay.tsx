import React from 'react';
import { DM } from '@/ui/TimerComponents';

/**
 * The second Focus face — a blocky pixel-art style, swipeable alongside the
 * wavy ring (see FocusCarousel). Same DM digit bitmaps as DMTimer, just drawn
 * as square pixels instead of dots, to match this style's chunkier look.
 */
export const PixelDigits: React.FC<{ mm: string; ss: string; color: string; maxWidth?: string }> = ({
  mm, ss, color, maxWidth = 'min(88vw, 480px)',
}) => {
  const cell = 15;
  const gap = 3;
  const step = cell + gap;
  const digitW = 4 * step - gap;
  const digitH = 5 * step - gap;
  const colGap = step * 1.1;

  const mmChars = mm.length === 3 ? [mm[0], mm[1], mm[2]] : [mm[0] ?? '0', mm[1] ?? '0'];
  const xPositions: number[] = [];
  let curX = 0;
  mmChars.forEach(() => { xPositions.push(curX); curX += digitW + colGap; });
  const xColon = curX;
  const xSS = xColon + step * 1.6;
  const ssPositions = [xSS, xSS + digitW + colGap];
  const totalW = ssPositions[1] + digitW;
  const pad = cell;

  const renderDigit = (digit: string, tx: number) =>
    (DM[digit] ?? DM['0']).flatMap((row, ri) =>
      row.map((val, ci) => (
        <rect
          key={`${tx}-${ri}-${ci}`}
          x={tx + ci * step} y={ri * step} width={cell} height={cell}
          fill={color} opacity={val ? 1 : 0.08}
        />
      ))
    );

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${totalW + pad * 2} ${digitH + pad * 2}`}
      style={{ width: maxWidth, height: 'auto' }}
      overflow="visible"
    >
      {mmChars.map((ch, i) => renderDigit(ch, xPositions[i]))}
      <rect x={xColon} y={digitH * 0.22} width={cell} height={cell} fill={color} opacity={0.5} />
      <rect x={xColon} y={digitH * 0.62} width={cell} height={cell} fill={color} opacity={0.5} />
      {renderDigit(ss[0] ?? '0', ssPositions[0])}
      {renderDigit(ss[1] ?? '0', ssPositions[1])}
    </svg>
  );
};

// 14×14 grid with the clock's center on the corner shared by the middle four
// cells, so the hub sits dead center.
const N = 14;
const C = N / 2;
const FACE_RADIUS = 6.95;
const RIM_FROM = 5.9;
const HOUR_MARKS = new Set(['1,6', '1,7', '12,6', '12,7', '6,1', '7,1', '6,12', '7,12']);

const distFromCenter = (r: number, c: number) => Math.hypot(c + 0.5 - C, r + 0.5 - C);

/**
 * A pixel-art clock: a square-pixel face in a neutral tone, with one ordinary
 * smooth hand in the session's color (green for focus, teal for break, gold
 * for overtime) so it always contrasts with the face. One turn a minute.
 *
 * The hand is driven by its own animation frame loop at a constant 6°/s, not
 * by the counter's integer-second ticks — those arrive a little early or late,
 * and a hand chasing them stalls and catches up. Instead it free-runs and is
 * only re-anchored to the counter if it ever drifts more than about a second
 * away (a new session, a reset, a tab that was backgrounded). Frozen while
 * paused. The angle is unwrapped so crossing 12 never spins it backwards.
 */
export const PixelClock: React.FC<{
  elapsedSeconds: number;
  mode: 'focus' | 'break';
  isOvertime: boolean;
  running: boolean;
  width?: string;
}> = ({ elapsedSeconds, mode, isOvertime, running, width = '120px' }) => {
  const handColor = isOvertime ? 'var(--pomo-overtime)' : mode === 'break' ? 'var(--pomo-break)' : 'var(--pomo-focus)';
  const face = 'color-mix(in srgb, var(--ink) 16%, var(--paper))';
  const rim = 'color-mix(in srgb, var(--ink) 38%, var(--paper))';
  const mark = 'color-mix(in srgb, var(--ink) 55%, var(--paper))';

  const counterRef = React.useRef(Math.max(0, Math.floor(elapsedSeconds)));
  counterRef.current = Math.max(0, Math.floor(elapsedSeconds));
  const handRef = React.useRef<SVGGElement>(null);
  // Seconds of elapsed time the hand is currently showing, and when that was set.
  const anchor = React.useRef({ seconds: counterRef.current, at: performance.now() });

  React.useEffect(() => {
    let frame = 0;
    const draw = (seconds: number) => {
      handRef.current?.style.setProperty('transform', `rotate(${seconds * 6}deg)`);
    };
    const tick = () => {
      const counter = counterRef.current;
      let shown = anchor.current.seconds + (performance.now() - anchor.current.at) / 1000;
      // The counter floors and its 200ms interval runs a little late, so a
      // healthy hand sits in [counter, counter + ~1.3). Only a real discontinuity
      // (new session, reset, throttled background tab) is far outside that —
      // a tighter bound mistakes ordinary tick jitter for drift and yanks the
      // hand backwards, which reads as it stalling.
      if (shown < counter - 1.5 || shown > counter + 2.5) {
        shown = counter + 0.5;
        anchor.current = { seconds: shown, at: performance.now() };
      }
      draw(shown);
      frame = requestAnimationFrame(tick);
    };
    if (running) {
      anchor.current = { seconds: Math.max(anchor.current.seconds, counterRef.current), at: performance.now() };
      frame = requestAnimationFrame(tick);
    } else {
      anchor.current = { seconds: counterRef.current, at: performance.now() };
      draw(counterRef.current);
    }
    return () => cancelAnimationFrame(frame);
  }, [running, running ? -1 : Math.floor(elapsedSeconds)]);

  const cell = 10;
  const gap = 1;
  const step = cell + gap;
  const size = N * step - gap;
  const center = size / 2;

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const d = distFromCenter(r, c);
      if (d > FACE_RADIUS) continue;
      const key = `${r},${c}`;
      const fill = d > RIM_FROM ? rim : HOUR_MARKS.has(key) ? mark : face;
      cells.push(<rect key={key} x={c * step} y={r * step} width={cell} height={cell} fill={fill} />);
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width, height: 'auto' }}>
      {cells}
      <g ref={handRef} style={{ transformOrigin: `${center}px ${center}px` }}>
        <line x1={center} y1={center + 12} x2={center} y2={center - 58} stroke={handColor} strokeWidth={5} strokeLinecap="round" />
      </g>
      <circle cx={center} cy={center} r={7} fill={handColor} />
    </svg>
  );
};
