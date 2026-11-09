import type { MaterialProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

export function material(props: Props): ItemDefinition {
  const rarity = props.rarity === undefined ? "common" : props.rarity
  const weight = props.weight === undefined ? 1 : props.weight

  return { name: props.name, kind: "material", rarity, description: props.description, price: props.price, stack: 99, weight, icon: props.icon }
}
