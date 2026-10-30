import type { ShapeId } from "#/world/core/items/weapon-types"

export function ironWeaponId(shape: ShapeId): `iron-${ShapeId}` {
  return `iron-${shape}`
}
