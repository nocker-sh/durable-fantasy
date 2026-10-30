import { METAL_NAME, METAL_RULES, METAL_TEXT } from "#/world/core/items/weapon-metals"
import type { Metal, Shape } from "#/world/core/items/weapon-types"
import type { Equipment, ItemDefinition } from "#/world/core/items/types"

/** Apply metal factors in their original rounding order while retaining the authored shape's scaling. */
export function weapon(metal: Metal, shape: Omit<Shape, "forge" | "text">, text: string): ItemDefinition {
  const rule = METAL_RULES[metal]
  const needs: Equipment["needs"] = Object.fromEntries(Object.entries(shape.needs).map((entry) => [entry[0], entry[1] + rule.needs]))
  const equip: Equipment = {
    part: "weapon",
    atk: Math.round(shape.atk * rule.atk),
    delay: Math.round((shape.delay * rule.delay) / 50) * 50,
    needs,
    scale: shape.scale,
    ...(shape.twoHanded ? { twoHanded: true } : {}),
  }

  return {
    made: true,
    name: `${METAL_NAME[metal]}の${shape.name}`,
    kind: "equipment",
    rarity: rule.rarity ?? "common",
    description: metal === "iron" ? text : `${text}${METAL_TEXT[metal]}`,
    price: Math.round((shape.price * rule.price) / 10) * 10,
    stack: 1,
    weight: Math.round(shape.weight * (metal === "steel" ? 0.95 : 1)),
    icon: shape.icon,
    metal,
    equip,
    ...(rule.milestone ? { milestone: rule.milestone } : {}),
  }
}
