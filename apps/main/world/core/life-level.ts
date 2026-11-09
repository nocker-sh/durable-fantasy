import { LIFE_FINAL } from "#/world/core/life-rules"
import { lifeThresholds } from "#/world/core/life-thresholds"

/** The level a total of experience makes. */
export function lifeLevel(exp: number): number {
  if (!(exp >= lifeThresholds[1])) return 0
  const bounds = { low: 1, high: LIFE_FINAL }
  while (bounds.low < bounds.high) {
    const middle = Math.ceil((bounds.low + bounds.high) / 2)
    if (exp >= lifeThresholds[middle]) bounds.low = middle
    else bounds.high = middle - 1
  }
  return bounds.low
}
