import type { FigurePart } from "#/world/core/monster-figure-types"

/** The joint a swinging part turns about: its own pivot, or the top centre of the part. */
export function getFigurePartPivot(part: FigurePart): readonly [number, number, number] {
  if (part.pivot) return part.pivot
  const half = part.shape === "ball" ? part.size[1] : part.size[1] / 2
  return [part.at[0], part.at[1] + half, part.at[2]]
}
