import { currentResidentName } from "#/world/core/current-resident-name"
import { MAKERS } from "#/world/core/makers"
import type { ItemId } from "#/world/core/items/catalog"

/** What a resident puts their name to: their own goods (makers.ts, where every shop's made goods come from). Commission outputs are finished by the player, so they stay the player's. */
const residentMakes = (name: string, item: ItemId): boolean => Object.hasOwn(MAKERS, name) && MAKERS[name][item] !== undefined

/**
 * The maker of a made thing as they go by now. A resident's former name (renamed-residents.ts) moves to the new one only on
 * what that resident makes; anything else kept under that name is a player's, made before the name was kept for the resident.
 */
export function currentMakerName(item: ItemId, by: string): string {
  const resident = currentResidentName(by)
  return resident !== by && residentMakes(resident, item) ? resident : by
}
