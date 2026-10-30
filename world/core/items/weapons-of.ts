import { WEAPONS } from "#/world/core/items/weapons"
import { isWeaponId } from "#/world/core/items/is-weapon-id"
import type { RemadeId, ShapeId } from "#/world/core/items/weapon-types"

/** Match the complete shape suffix so a shorter hyphenated name cannot select another shape. */
export function weaponsOf(...shapes: (ShapeId | RemadeId)[]) {
  return Object.keys(WEAPONS)
    .filter(isWeaponId)
    .filter((id) => shapes.some((shape) => id.endsWith(`-${shape}`) && id.split("-").length === shape.split("-").length + 1))
}
