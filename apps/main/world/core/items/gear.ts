import type { GearProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

export function gear(props: Props): ItemDefinition {
  const rarity = props.rarity === undefined ? "common" : props.rarity

  return { name: props.name, kind: "equipment", rarity, description: props.description, price: props.price, stack: 1, weight: props.weight, icon: props.icon, equip: props.equip }
}
