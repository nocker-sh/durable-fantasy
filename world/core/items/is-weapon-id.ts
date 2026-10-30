import { WEAPONS } from "#/world/core/items/weapons"
import type { WeaponId } from "#/world/core/items/weapon-types"

export function isWeaponId(value: string): value is WeaponId {
  return Object.hasOwn(WEAPONS, value)
}
