import { WEAPON_SHAPES } from "#/world/core/items/weapon-shapes"
import type { ShapeId } from "#/world/core/items/weapon-types"

export function isShapeId(value: string): value is ShapeId {
  return Object.hasOwn(WEAPON_SHAPES, value)
}
