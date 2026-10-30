import type { FoodProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

/** Raw food restores health and modest stamina without adding warmth. */
export function food(props: Props): ItemDefinition {
  const weight = props.weight === undefined ? 2 : props.weight

  return {
    name: props.name,
    kind: "consumable",
    rarity: "common",
    description: props.description,
    price: props.price,
    stack: 99,
    weight,
    icon: props.icon,
    use: { hp: props.hp, stamina: Math.ceil(props.hp / 2), full: Math.ceil(props.hp * 0.7) },
  }
}
