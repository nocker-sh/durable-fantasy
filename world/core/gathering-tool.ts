import type { Stack } from "./bag.ts"
import { ITEMS, QUALITY_EFFECT, type GatherSkill } from "./items.ts"
import type { PlayerState } from "./player.ts"

type GatheringTool = { stack: Stack; power: number } & ({ source: "bag"; index: number } | { source: "weapon" })

/** Best usable tool, comparing quality-adjusted power; the held tool wins ties. */
export function gatheringTool(state: Pick<PlayerState, "bag" | "equipment" | "worn">, skill: GatherSkill): GatheringTool | null {
  let selected: GatheringTool | null = null
  for (const [index, stack] of state.bag.entries()) {
    if (!stack || (stack.dur ?? 0) <= 0) continue
    const tool = ITEMS[stack.item].tool
    if (tool?.skill !== skill) continue
    const power = tool.power * QUALITY_EFFECT[stack.q ?? 1]
    if (!selected || power > selected.power) selected = { source: "bag", index, stack, power }
  }
  const item = state.equipment.weapon
  const worn = state.worn.weapon
  const tool = item && ITEMS[item].tool
  if (item && tool && tool.skill === skill && (worn?.dur ?? 0) > 0) {
    const power = tool.power * QUALITY_EFFECT[worn?.q ?? 1]
    if (!selected || power >= selected.power) return { source: "weapon", stack: { item, count: 1, ...worn }, power }
  }
  return selected
}
