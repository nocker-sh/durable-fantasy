import { HOUSEHOLDS } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import type { WallKind } from "#/world/town/style"

/** What a household builds with. */
export function wallsFor(h: HouseDef): WallKind[] {
  const living = HOUSEHOLDS.find((x) => x.id === h.household)?.living
  // against sparks and thieves, and to keep a cellar cool: stone
  if (["smith", "armorer", "crystal", "warehouse", "tavern"].includes(h.household ?? "")) return ["stone"]
  // those who cut and work wood, and the farm, build in boards
  if (["woodcutter", "woodworker", "farm", "shepherd"].includes(h.household ?? "")) return ["board"]
  if (living === "ゆとりがある" || h.kind === "public") return ["timber", "stone"]
  if (living === "慎ましい") return ["plaster", "board"]
  return ["plaster", "timber"]
}
