import type { Stack } from "#/world/core/bag-types"
import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_EFFECT } from "#/world/core/items/kinds"
import type { GatherSkill } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"

type GatheringTool = { stack: Stack; power: number } & ({ source: "bag"; index: number } | { source: "weapon" })

/** Best usable tool, comparing quality-adjusted power; the held tool wins ties. */
export function gatheringTool(state: Pick<PlayerState, "bag" | "equipment" | "worn">, skill: GatherSkill): GatheringTool | null {
  const selected = state.bag.reduce<GatheringTool | null>((best, stack, index) => {
    if (!stack || (stack.dur ?? 0) <= 0) return best
    const tool = ITEMS[stack.item].tool
    if (tool?.skill !== skill) return best
    const power = tool.power * QUALITY_EFFECT[stack.q ?? 1]
    if (best && !(power > best.power)) return best

    return { source: "bag", index, stack, power }
  }, null)
  const item = state.equipment.weapon
  const worn = state.worn.weapon
  const tool = item && ITEMS[item].tool
  if (item && tool && tool.skill === skill && (worn?.dur ?? 0) > 0) {
    const power = tool.power * QUALITY_EFFECT[worn?.q ?? 1]
    if (!selected || power >= selected.power) return { source: "weapon", stack: { item, count: 1, ...worn }, power }
  }
  return selected
}
