import { useEffect, useRef, useState } from 'react';

/**
 * Drives WavyRing's wave phase, slow self-rotation, and smoothly-interpolated
 * progress percentage. Shared by Pomodoro.tsx (the full focus page) and
 * Home.tsx (the mini ring on the dashboard's big Focus card) so both render
 * the exact same motion instead of two hand-tuned copies drifting apart.
 */
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
  const [phase, setPhase] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [smoothPct, setSmoothPct] = useState(0);
  const baselinePctRef = useRef(0);
  const baselineTimeRef = useRef(Date.now());

  // Update baseline when pct ticks (once per second)
  useEffect(() => {
    baselinePctRef.current = pct;
    baselineTimeRef.current = Date.now();
  }, [pct]);

  useEffect(() => {
    let animId: number;
    // Radians per second the wave phase advances — driven off the rAF timestamp's real
    // delta (not a fixed amount per *frame*) so the speed is the same on every screen,
    // 60Hz or 120Hz or anything else, instead of silently running faster on a
    // higher-refresh display just because more frames fire per second. Calibrated at
    // 120 frames/sec worth of motion so it reads at the same pace everywhere.
    const PHASE_RATE = 0.05 * 120;
    // Degrees per second the whole ring spins around its own center — layered on top
    // of the wave, only while a session is actually running (or in overtime). Same
    // time-based approach as PHASE_RATE, so it's one full rotation every 9s on any
    // screen, not tied to frame count.
    const ROTATION_DEG_PER_SEC = 360 / 9;
    let lastFrameTime: number | null = null;
    const animate = (time: number) => {
      const dt = lastFrameTime === null ? 0 : (time - lastFrameTime) / 1000;
      lastFrameTime = time;
      setPhase(p => (p + PHASE_RATE * dt) % (Math.PI * 2));
      if (running || isOvertime) {
        setRotation(r => (r + ROTATION_DEG_PER_SEC * dt) % 360);
      }
      if (running && !isOvertime) {
        const elapsed = (Date.now() - baselineTimeRef.current) / 1000;
        setSmoothPct(Math.min(baselinePctRef.current + (elapsed / totalSecs) * 100, 100));
      } else {
        setSmoothPct(pct);
      }
      animId = requestAnimationFrame(animate);
    };
    if (running || isOvertime) animId = requestAnimationFrame(animate);
    else setSmoothPct(pct);
    return () => cancelAnimationFrame(animId);
  }, [running, isOvertime, totalSecs, pct]);

  return { phase, rotation, smoothPct };
}
