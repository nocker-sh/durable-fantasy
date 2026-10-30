import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** Check scale and dimensions before entrance geometry or floor-level validation. */
export function assertAuthoredPlanDimensions(source: AuthoredPlan): void {
  if (!Number.isFinite(source.cellM) || source.cellM <= 0 || ![source.width, source.depth, source.floors].every((value) => Number.isSafeInteger(value) && value > 0))
    throw new Error("Invalid authored plan dimensions")
  if (!Number.isFinite(source.entryHeight) || source.entryHeight <= 0) throw new Error("Invalid authored entrance height")
  if (!Number.isSafeInteger(source.entryWidth) || source.entryWidth <= 0) throw new Error("Invalid authored entrance width")
}
