import { WEAPON_SHAPES } from "#/world/core/items/weapon-shapes"
import { isShapeId } from "#/world/core/items/is-shape-id"
import { ironForgeOf } from "#/world/core/items/iron-forge-of"
import type { Shape, WeaponId } from "#/world/core/items/weapon-types"

const remadeForge: Shape["forge"] = { iron: 2, plank: 1, fur: 0, min: 4 }

/** Preserve the input order and metal-specific milestone for each current weapon ID. */
export function forgeOf(id: WeaponId): { inputs: [string, number][]; min: number } {
  const parts = id.split("-")
  const metal = parts[0]
  const shape = parts.slice(1).join("-")
  const forge = isShapeId(shape) ? WEAPON_SHAPES[shape].forge : remadeForge
  if (metal === "iron") return ironForgeOf(forge)
  if (metal === "steel")
    return {
      inputs: [
        ["iron-ingot", forge.iron * 2],
        ["black-oak-heart", 1],
        ["charcoal", 2],
      ],
      min: 16,
    }

  return {
    inputs: [
      ["engine-core", Math.max(1, Math.ceil(forge.iron / 2))],
      ["iron-ingot", forge.iron],
      ["black-oak-heart", 1],
      ["charcoal", 2],
    ],
    min: 32,
  }
}
