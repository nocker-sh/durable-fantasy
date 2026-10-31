import { isAuthoredFloorLevelValid } from "#/world/town/floorplan/is-authored-floor-level-valid"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** Shared structural validation runs before authoring geometry and before runtime projection. */
export function assertAuthoredFloorLevels(levels: AuthoredPlan["floorLevels"], floors: number) {
  if (!Number.isSafeInteger(floors) || floors < 1 || levels.length !== floors) throw new Error("Authored floor levels are incomplete")
  const byFloor = new Map<number, AuthoredPlan["floorLevels"][number]>()

  for (const level of levels) {
    if (!Number.isSafeInteger(level.floor) || level.floor < 0 || level.floor >= floors || byFloor.has(level.floor)) throw new Error("Invalid authored floor thickness or elevation")
    byFloor.set(level.floor, level)
  }
  for (const level of byFloor.values()) {
    if (!isAuthoredFloorLevelValid({ level, below: byFloor.get(level.floor - 1) ?? null })) throw new Error("Invalid authored floor thickness or elevation")
  }
}
