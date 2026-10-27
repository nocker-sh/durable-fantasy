// Gathering transition after the dispatcher's recovery and fallen-player checks.
// Node distance and shared stock are checked by the map room before this command.
import { addItem, type Stack } from "./bag.ts"
import type { ServerCommand } from "./commands.ts"
import { GATHER_STAMINA, nodeOf, yieldOf } from "./gather.ts"
import { ITEMS, type ItemId, type Quality } from "./items.ts"
import { GATHER_EXP, gainLife, lifeLevel } from "./life.ts"
import { warmNow, type PlayerState } from "./player.ts"
import { gatheringTool } from "./gathering-tool.ts"
import { accept, reject, type Transition } from "./transition.ts"

export function gather(state: PlayerState, command: Extract<ServerCommand, { type: "gather" }>, now: number): Transition {
  const node = nodeOf(command.node)
  if (!node) return reject("SPENT")
  const selected = gatheringTool(state, node.skill)
  if (node.needsTool && !selected) return reject("NO_TOOL")
  const cost = Math.ceil(GATHER_STAMINA * (warmNow(state, now) ? 1 : 1.5))
  if (state.stamina < cost) return reject("EXHAUSTED")
  const power = selected?.power ?? 1
  const level = lifeLevel(state.life[node.skill])
  const got = yieldOf(node, level, power, command.roll)
  const bag: (Stack | null)[] = [...state.bag]
  let equipment = state.equipment,
    worn = state.worn
  let broke: ItemId | null = null
  if (selected) {
    const tool = selected.stack
    const dur = (tool.dur ?? 1) - 1
    if (selected.source === "weapon") {
      if (dur <= 0) {
        broke = tool.item
        equipment = { ...equipment, weapon: null }
        const { weapon: _, ...rest } = worn
        worn = rest
      } else worn = { ...worn, weapon: { ...state.worn.weapon, dur } }
    } else if (dur <= 0) {
      broke = tool.item
      bag[selected.index] = null
    } else bag[selected.index] = { ...tool, dur }
  }
  const made = ITEMS[got.item].made ? { q: 1 as Quality, by: state.name } : undefined
  const added = addItem(bag, got.item, got.count, made)
  if (!added) return reject("BAG_FULL")
  const grown = gainLife(state.life, node.skill, GATHER_EXP)
  return accept(
    { ...state, bag: added, equipment, worn, stamina: state.stamina - cost, life: grown.life },
    { type: "gathered", item: got.item, count: got.count, skill: node.skill, level: grown.level, up: grown.up, broke },
  )
}
