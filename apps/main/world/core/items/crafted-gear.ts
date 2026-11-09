import { gear } from "#/world/core/items/gear"
import type { GearProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

/** Produced equipment retains its base definition and supports maker quality. */
export function craftedGear(props: Props): ItemDefinition {
  return { ...gear(props), made: true }
}
