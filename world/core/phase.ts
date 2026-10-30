import type { Phase } from "#/world/core/clock-types"

/** Time labels share the town clock and retain their existing half-open boundaries. */
export function phase(min: number): Phase {
  if (min >= 9 * 60 && min < 10.5 * 60) return "夜明け"
  if (min >= 10.5 * 60 && min < 15.5 * 60) return "昼"
  if (min >= 15.5 * 60 && min < 17.5 * 60) return "夕暮れ"
  return "夜"
}
