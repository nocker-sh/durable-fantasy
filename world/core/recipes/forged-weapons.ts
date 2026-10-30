import { WEAPONS } from "#/world/core/items/weapons"
import { forgeOf } from "#/world/core/items/forge-of"
import type { WeaponId } from "#/world/core/items/weapon-types"
import { isItemId } from "#/world/core/items/is-item-id"
import type { Recipe } from "#/world/core/recipes/definition"

/** Preserve the shared quality-aware recipe registry while adding every upstream shape and metal. */
export const FORGED_WEAPON_RECIPES: readonly Recipe[] = Object.keys(WEAPONS)
  .filter((id): id is WeaponId => Object.hasOwn(WEAPONS, id))
  .map((id) => {
    const forge = forgeOf(id)
    return {
      id,
      skill: "smithing",
      station: "forge",
      min: forge.min,
      output: { item: id, count: 1 },
      inputs: forge.inputs.map((input) => {
        const item = input[0]
        if (!isItemId(item)) throw new Error("Unknown forged weapon material")
        return { item, count: input[1] }
      }),
    }
  })
