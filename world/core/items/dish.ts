import type { DishProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

/** Cooked food retains its authored recovery, fullness and warmth and supports maker quality. */
export function dish(props: Props): ItemDefinition {
  const weight = props.weight === undefined ? 3 : props.weight
  const rarity = props.rarity === undefined ? "common" : props.rarity

  return { name: props.name, kind: "consumable", rarity, description: props.description, price: props.price, stack: 30, weight, icon: props.icon, use: props.use, made: true }
}
