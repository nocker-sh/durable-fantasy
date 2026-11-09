import { smooth } from "#/lib/engine/smooth"

/** Keep the dawn and dusk colour curves independent of the daylight amount. */
export function dusk(min: number): number {
  const evening = smooth(15 * 60, 16.5 * 60, min) * (1 - smooth(17 * 60, 18 * 60, min))
  const morning = smooth(8.8 * 60, 9.6 * 60, min) * (1 - smooth(9.8 * 60, 10.6 * 60, min)) * 0.5
  return Math.max(evening, morning)
}
