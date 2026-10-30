/** Minutes since midnight in Japan, including timestamps before the epoch. */
export function jstMinutes(now: number): number {
  const m = Math.floor(now / 60_000) + 9 * 60
  return ((m % 1440) + 1440) % 1440
}
