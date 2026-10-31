import { authoredFloorLevelsSourceSchema, authoredFloorFoundationSchema } from "#/scripts/lib/authored-floor-levels-source-schema"
import { assertAuthoredFloorLevels } from "#/world/town/floorplan/assert-authored-floor-levels"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Decode structural heights without coercion and validate them with the same rule used by runtime projection. */
export function getAuthoredFloorLevels(building: SettingDocument, floors: number): AuthoredPlan["floorLevels"] {
  const source = authoredFloorLevelsSourceSchema.safeParse(building.floor_levels)
  if (!source.success) throw new Error("Authored floor levels are incomplete")
  const foundation = authoredFloorFoundationSchema.safeParse(building.foundation)
  if (!foundation.success) throw new Error("Invalid authored floor thickness or elevation")
  const byFloor = new Map(source.data.map((level) => [level.floor, level]))
  const levels = source.data.map((level) => {
    const below = byFloor.get(level.floor - 1)
    const heights = { floor: level.floor, elevation: level.elevation_m, ceiling: level.ceiling_elevation_m }
    if (level.floor === 0) return { ...heights, thickness: foundation.data.floor_thickness_m }
    if (!below) throw new Error("Invalid authored floor thickness or elevation")
    return { ...heights, thickness: level.elevation_m - below.ceiling_elevation_m }
  })
  assertAuthoredFloorLevels(levels, floors)
  return levels
}
