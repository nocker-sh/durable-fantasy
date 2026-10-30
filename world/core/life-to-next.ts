/** Experience to go from a level to the next. */
export function lifeToNext(level: number): number {
  return Math.round(40 * (level + 1) ** 1.5)
}
