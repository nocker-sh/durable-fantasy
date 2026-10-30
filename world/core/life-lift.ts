/** How practised the hand is for quality, from 0 (never done it) to 1 (level 64). */
export function lifeLift(level: number): number {
  return Math.log2(level + 1) / 6
}
