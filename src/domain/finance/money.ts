/** Rounds and formats an amount as Egyptian pounds: 1234.5 → "1,235 EGP". */
export function formatEGP(n: number): string {
  return `${Math.round(n).toLocaleString('en-EG')} EGP`;
}
