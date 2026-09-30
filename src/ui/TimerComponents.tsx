// ─── Dot-matrix digit data (5 rows × 4 cols) ──────────────────────────────
export const DM: Record<string, number[][]> = {
  '0':[[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
  '1':[[0,0,1,0],[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,1,1,1]],
  '2':[[1,1,1,1],[0,0,0,1],[1,1,1,1],[1,0,0,0],[1,1,1,1]],
  '3':[[1,1,1,1],[0,0,0,1],[0,1,1,1],[0,0,0,1],[1,1,1,1]],
  '4':[[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1]],
  '5':[[1,1,1,1],[1,0,0,0],[1,1,1,1],[0,0,0,1],[1,1,1,1]],
  '6':[[1,1,1,1],[1,0,0,0],[1,1,1,1],[1,0,0,1],[1,1,1,1]],
  '7':[[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,0,0]],
  '8':[[1,1,1,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,1,1,1]],
  '9':[[1,1,1,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1]],
};

// Single responsive SVG that renders MM:SS in dot-matrix, scales via viewBox.
// Supports 2 or 3 digit minutes (e.g. 99:59 or 130:00).
export const DMTimer: React.FC<{ mm: string; ss: string; color: string; maxWidth?: string }> = ({
  mm, ss, color, maxWidth = 'min(88vw, 540px)'
}) => {
  const mS = 28; const mR = 10;
  const sS = 17; const sR = 6;
  const mH = 4 * mS;
  const sH = 4 * sS;
  const sOffY = (mH - sH) / 2;
  const digitBlockW = 3 * mS + mR * 2; // width occupied by one digit block

  // Build x-positions for each mm digit dynamically
  const mmChars = mm.length === 3 ? [mm[0], mm[1], mm[2]] : [mm[0] ?? '0', mm[1] ?? '0'];
  const mmXPositions: number[] = [];
  let curX = 0;
  mmChars.forEach((_, i) => {
    mmXPositions.push(curX);
    curX += digitBlockW + (i < mmChars.length - 1 ? 18 : 10);
  });

  const xCol  = curX;
  const colCX = xCol + mR * 1.5;
  const xSS0  = xCol + mR * 3 + 14;
  const xSS1  = xSS0 + 3 * sS + sR * 2 + 14;
  const totalW = xSS1 + 3 * sS;
  const pad = mR + 4;

  const renderDigit = (digit: string, tx: number, ty: number, step: number, r: number) =>
    (DM[digit] ?? DM['0']).flatMap((row, ri) =>
      row.map((val, ci) => (
        <circle key={`${tx}-${ri}-${ci}`}
          cx={tx + ci * step} cy={ty + ri * step} r={r}
          fill={color} opacity={val ? 1 : 0.07}
          style={val ? {
            animation: 'dotPulse 2.4s ease-in-out infinite',
            animationDelay: `${(ri * 4 + ci) * 0.06}s`,
          } : undefined} />
      ))
    );

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${totalW + pad * 2} ${mH + pad * 2}`}
      style={{ width: maxWidth, height: 'auto' }}
      overflow="visible"
    >
      {mmChars.map((ch, i) => renderDigit(ch, mmXPositions[i], 0, mS, mR))}
      <circle cx={colCX} cy={mH * 0.3} r={mR} fill={color} opacity={0.4} />
      <circle cx={colCX} cy={mH * 0.7} r={mR} fill={color} opacity={0.4} />
      {renderDigit(ss[0], xSS0, sOffY, sS, sR)}
      {renderDigit(ss[1], xSS1, sOffY, sS, sR)}
    </svg>
  );
};

// ─── Wavy Timer Ring (Matches user screenshot: smooth left, wavy right, split with top/bottom gaps) ───
// Shared by Pomodoro.tsx (the full focus page) and Home.tsx (the mini ring on
// the dashboard's big Focus card) — same object in both places, driven by the
// same useRingAnimation hook, so opening Focus from Home isn't a scene change.
export const WavyRing: React.FC<{
  pct: number;
  phase: number;
  mode: 'focus' | 'break';
  isOvertime: boolean;
  size?: number;
  waves: number;
  rotation?: number;
}> = ({ pct, phase, mode, isOvertime, size = 300, waves, rotation = 0 }) => {
  const half = size / 2;
  const baseR = half * 0.82;
  const gapAngle = 0.04; // Tiny visual seam where progress meets remaining

  // Sweeps `sweep` radians starting at `startAngle` (clockwise, 12 o'clock = -PI/2).
  // Wavy traces progress (elapsed) — its arc length IS the pct, so it grows as time
  // passes; the smooth arc is what's left of the circle and shrinks to match.
  const generateArcPath = (startAngle: number, sweep: number, wavy: boolean) => {
    const amplitude = size * (waves > 40 ? 0.015 : 0.02);
    const pathPoints: string[] = [];
    // Resolution scales with how many wave CYCLES actually appear in this sweep, not
    // with the sweep angle itself — a flat minimum point count meant short arcs with
    // many cycles (early progress, before it grows past a certain size) got squeezed
    // into too few points and rendered as jagged, faceted kinks instead of a smooth curve.
    const cyclesInSweep = (sweep / (Math.PI * 2)) * waves;
    const steps = wavy
      ? Math.max(8, Math.ceil(cyclesInSweep * 24))
      : Math.max(2, Math.round(300 * (sweep / (Math.PI * 2))));
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (i / steps) * sweep;
      const wave = wavy ? Math.sin(angle * waves + phase) * amplitude : 0;
      const r = baseR + wave;
      const x = half + r * Math.cos(angle);
      const y = half + r * Math.sin(angle);
      pathPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`);
    }
    return pathPoints.join(' ');
  };

  const clampedPct = Math.max(0, Math.min(100, pct));
  const fullSweep = Math.PI * 2 - gapAngle * 2;
  const progressSweep = fullSweep * (clampedPct / 100);
  const remainingSweep = fullSweep - progressSweep;
  const startAngle = -Math.PI / 2 + gapAngle;

  const wavyProgressPath = generateArcPath(startAngle, progressSweep, true);
  const smoothRemainingPath = generateArcPath(startAngle + progressSweep + gapAngle * 2, Math.max(0, remainingSweep - gapAngle * 2), false);

  const strokeColor = isOvertime
    ? 'var(--pomo-overtime)'
    : (mode === 'break' ? 'var(--pomo-break)' : 'var(--pomo-focus)');

  return (
    <svg viewBox={`0 0 ${size} ${size}`}
      className="block overflow-visible w-full h-full"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
      shapeRendering="geometricPrecision"
    >
      {/* The whole ring — both the wavy progress and the smooth remaining track —
          spins together around its own center while a session is running, layered
          on top of the wave animation rather than replacing it. */}
      <g transform={`rotate(${rotation} ${half} ${half})`}>
        {/* Wavy Progress (elapsed) — grows as time passes */}
        {progressSweep > 0 && (
          <path
            d={wavyProgressPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={size * 0.024}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Smooth Remaining (time left) — shrinks as the wavy progress grows */}
        {remainingSweep > gapAngle * 2 && (
          <path
            d={smoothRemainingPath}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={size * 0.015}
            strokeLinecap="round"
            className="opacity-[0.12]"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </g>
    </svg>
  );
};
