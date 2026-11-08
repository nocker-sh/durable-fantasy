import type { MedicineProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

export function medicine(props: Props): ItemDefinition {
  const rarity = props.rarity === undefined ? "common" : props.rarity
  const weight = props.weight === undefined ? 5 : props.weight

  return { name: props.name, kind: "consumable", rarity, description: props.description, price: props.price, stack: 99, weight, icon: props.icon, use: props.use }
}
