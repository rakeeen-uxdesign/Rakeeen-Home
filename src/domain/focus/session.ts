/** Rules for a focus session. */

/**
 * A break is 20% of the focus time just completed (base + overtime),
 * rounded, never shorter than a minute.
 *   25m focus → 5m    ·   50m → 10m   ·   3m → 1m
 */
export function breakMinutesFor(focusGainedMinutes: number): number {
  return Math.max(1, Math.round(focusGainedMinutes * 0.2));
}
