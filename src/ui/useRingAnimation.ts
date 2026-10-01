import { useEffect, useRef, useState } from 'react';

/**
 * Drives WavyRing's wave phase, slow self-rotation, and smoothly-interpolated
 * progress percentage. Shared by Pomodoro.tsx (the full focus page) and
 * Home.tsx (the mini ring on the dashboard's big Focus card) so both render
 * the exact same motion instead of two hand-tuned copies drifting apart.
 */
// Radians per second the wave phase advances — driven off wall-clock time (not a fixed
// amount per *frame*, and not accumulated in per-mount React state) so the speed is the
// same on every screen, 60Hz or 120Hz or anything else, instead of silently running
// faster on a higher-refresh display just because more frames fire per second.
// Calibrated at 120 frames/sec worth of motion so it reads at the same pace everywhere.
const PHASE_RATE = 0.05 * 120;
// Degrees per second the whole ring spins around its own center — one full rotation
// every 9s. Same wall-clock-time approach as PHASE_RATE.
const ROTATION_DEG_PER_SEC = 360 / 9;

const phaseAt = (ms: number) => (ms / 1000 * PHASE_RATE) % (Math.PI * 2);
const rotationAt = (ms: number) => (ms / 1000 * ROTATION_DEG_PER_SEC) % 360;

export function useRingAnimation({
  running,
  isOvertime,
  pct,
  totalSecs,
}: {
  running: boolean;
  isOvertime: boolean;
  pct: number;
  totalSecs: number;
}) {
  // Seeded from Date.now() — a pure function of wall-clock time, not an accumulator
  // that starts back at 0 on every mount. Home's mini ring and the full /pomodoro
  // page's ring are separate component instances that mount and unmount independently
  // as you navigate; seeding from the clock instead of counting frames since mount is
  // what makes the spin continuous across that navigation instead of visibly snapping
  // back to its starting position.
  const [phase, setPhase] = useState(() => phaseAt(Date.now()));
  const [rotation, setRotation] = useState(() => rotationAt(Date.now()));
  const [smoothPct, setSmoothPct] = useState(0);
  const baselinePctRef = useRef(0);
  const baselineTimeRef = useRef(Date.now());

  // Mirror the latest displayed phase/rotation into refs so the animate effect below
  // can re-anchor to wherever they were actually frozen (e.g. right before a pause)
  // instead of jumping to a fresh wall-clock value when it restarts. Across a quick
  // navigation remount the two are nearly identical (no visible jump either way), but
  // across a real pause — seconds, minutes, however long — the wall-clock value can
  // land anywhere in its 9s cycle, and re-anchoring to the frozen one is what makes
  // resuming continue smoothly instead of the ring visibly snapping to a new position.
  const phaseRef = useRef(phase);
  const rotationRef = useRef(rotation);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);

  // Update baseline when pct ticks (once per second)
  useEffect(() => {
    baselinePctRef.current = pct;
    baselineTimeRef.current = Date.now();
  }, [pct]);

  useEffect(() => {
    let animId: number;
    // Only `running` keeps the wave/rotation moving — `isOvertime` alone must NOT,
    // since overtime can now be paused (Pomodoro's Stop button) while staying in
    // the overtime state. `running || isOvertime` here made the ring keep spinning
    // forever after a paused-overtime Stop, even though the time display had frozen.
    if (running) {
      const basePhase = phaseRef.current;
      const baseRotation = rotationRef.current;
      const startTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const elapsedSec = (now - startTime) / 1000;
        setPhase((basePhase + PHASE_RATE * elapsedSec) % (Math.PI * 2));
        setRotation((baseRotation + ROTATION_DEG_PER_SEC * elapsedSec) % 360);
        if (running && !isOvertime) {
          const elapsed = (now - baselineTimeRef.current) / 1000;
          setSmoothPct(Math.min(baselinePctRef.current + (elapsed / totalSecs) * 100, 100));
        } else {
          setSmoothPct(pct);
        }
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    } else {
      setSmoothPct(pct);
    }
    return () => cancelAnimationFrame(animId);
  }, [running, isOvertime, totalSecs, pct]);

  return { phase, rotation, smoothPct };
}
