import { WEAPONS, forgeOf, type WeaponId } from "../items/weapons"
import { isItemId } from "../items"
import type { Recipe } from "./definition"

/** Preserve the shared quality-aware recipe registry while adding every upstream shape and metal. */
export const FORGED_WEAPON_RECIPES: readonly Recipe[] = Object.keys(WEAPONS).filter((id): id is WeaponId => Object.hasOwn(WEAPONS, id)).map((id) => {
  const forge = forgeOf(id)
  return { id, skill: "smithing", station: "forge", min: forge.min, output: { item: id, count: 1 }, inputs: forge.inputs.map((input) => {
    const item = input[0]
    if (!isItemId(item)) throw new Error("Unknown forged weapon material")
    return { item, count: input[1] }
  }) }
})
