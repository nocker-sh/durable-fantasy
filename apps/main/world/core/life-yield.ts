/** How many come at one go at a spot: one more at 4 and again at 8. */
export function lifeYield(level: number): number {
  return 1 + (level >= 4 ? 1 : 0) + (level >= 8 ? 1 : 0)
}
