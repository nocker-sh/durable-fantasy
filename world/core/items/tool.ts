import type { ToolProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

/** A produced gathering tool can also carry an authored weapon definition. */
export function tool(props: Props): ItemDefinition {
  return {
    name: props.name,
    kind: "tool",
    rarity: "common",
    description: props.description,
    price: props.price,
    stack: 1,
    weight: props.weight,
    icon: props.icon,
    tool: { skill: props.skill, power: props.power, durability: props.durability },
    made: true,
    ...(props.equip ? { equip: props.equip } : {}),
  }
}
