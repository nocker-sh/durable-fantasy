import type { CombatCommand } from "#/world/core/combat-delivery-types"

/** 再送は被害元・個数と品の順序を含めて同じ内容だけを認める。 */
export function sameCombatCommand(a: CombatCommand, b: CombatCommand): boolean {
  if (a.type === "hurt") return b.type === "hurt" && a.amount === b.amount && a.by === b.by
  if (b.type === "hurt" || a.type !== b.type || a.monster !== b.monster || a.exp !== b.exp) return false
  return a.type !== "loot" || (b.type === "loot" && a.items.length === b.items.length && a.items.every((item, i) => item === b.items[i]))
}
