import type { Quality } from "#/world/core/items/kinds"
import { lifeLift } from "#/world/core/life-lift"

/**
 * The quality of what comes out: the roll against chances that rise with the skill's level and
 * with the quality of what went in (an average of the made inputs, 1 when none were made).
 */
export function craftedQuality(level: number, inputQuality: number, roll: number): Quality {
  const lift = lifeLift(level) + (inputQuality - 1) * 0.15
  const pTop = Math.max(0, lift - 0.55) * 0.5 // 極
  const pHigh = Math.min(0.5, Math.max(0, lift * 0.45)) // 上
  const pLow = Math.max(0.05, 0.45 - lift * 0.6) // 並
  if (roll < pTop) return 3
  if (roll < pTop + pHigh) return 2
  if (roll > 1 - pLow) return 0
  return 1
}
