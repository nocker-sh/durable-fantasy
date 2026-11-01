import type { FigurePart } from "#/world/core/monster-figure-types"
import { getFigurePartPivot } from "#/world/core/get-figure-part-pivot"

/** How far from the figure's centre line a part can reach on the ground plane, whatever its turn or swing. */
export function getFigurePartReach(part: FigurePart): number {
  const s = part.size
  const radius =
    part.shape === "box"
      ? Math.hypot(s[0], s[1], s[2]) / 2
      : part.shape === "ball"
        ? Math.max(s[0], s[1], s[2])
        : part.shape === "cone"
          ? Math.hypot(s[0], s[1] / 2)
          : Math.hypot(Math.max(s[0], s[2]), s[1] / 2)
  const still = Math.hypot(part.at[0], part.at[2]) + radius
  if (!part.swing) return still
  const pivot = getFigurePartPivot(part)
  const arm = Math.hypot(part.at[0] - pivot[0], part.at[1] - pivot[1], part.at[2] - pivot[2]) + radius
  return Math.max(still, Math.hypot(pivot[0], pivot[2]) + arm)
}
