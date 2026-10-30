import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** Shared structural validation runs before authoring geometry and before runtime projection. */
export function assertAuthoredFloorLevels(levels: AuthoredPlan["floorLevels"], floors: number) {
  if (levels.length !== floors) throw new Error("Authored floor levels are incomplete")
  for (const floor of Array.from({ length: floors }, (_, index) => index)) {
    const level = levels.find((level) => level.floor === floor),
      below = levels.find((level) => level.floor === floor - 1)
    if (
      !level ||
      ![level.elevation, level.ceiling, level.thickness].every(Number.isFinite) ||
      level.ceiling <= level.elevation ||
      level.thickness <= 0 ||
      (below && Math.abs(level.elevation - below.ceiling - level.thickness) > 1e-9)
    )
      throw new Error("Invalid authored floor thickness or elevation")
  }
}
