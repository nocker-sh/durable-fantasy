// Gathering transition after the dispatcher's recovery and fallen-player checks.
// Node distance and shared stock are checked by the map room before this command.
import { addItem, type Stack } from "./bag.ts"
import type { ServerCommand } from "./commands.ts"
import { GATHER_STAMINA, nodeOf, yieldOf } from "./gather.ts"
import { ITEMS, QUALITY_EFFECT, type ItemId, type Quality } from "./items.ts"
import { GATHER_EXP, gainLife, lifeLevel } from "./life.ts"
import { warmNow, type PlayerState } from "./player.ts"
import { accept, reject, type Transition } from "./transition.ts"

export function gather(state: PlayerState, command: Extract<ServerCommand, { type: "gather" }>, now: number): Transition {
  const node = nodeOf(command.node)
  if (!node) return reject("SPENT")
  // the best tool of the skill that still has uses: in the bag, or held as a weapon (the woodcutter's axe)
  const powerOf = (item: ItemId, q: Quality | undefined) => ITEMS[item].tool!.power * QUALITY_EFFECT[q ?? 1]
  let toolAt = -1
  state.bag.forEach((s, i) => {
    const t = s && ITEMS[s.item].tool
    if (t?.skill === node.skill && (s!.dur ?? 0) > 0 && (toolAt < 0 || powerOf(state.bag[toolAt]!.item, state.bag[toolAt]!.q) < powerOf(s!.item, s!.q))) toolAt = i
  })
  const held = state.equipment.weapon,
    heldWorn = state.worn.weapon
  const holding = !!held && ITEMS[held].tool?.skill === node.skill && (heldWorn?.dur ?? 0) > 0
  const useHeld = holding && (toolAt < 0 || powerOf(held!, heldWorn?.q) >= powerOf(state.bag[toolAt]!.item, state.bag[toolAt]!.q))
  if (node.needsTool && toolAt < 0 && !useHeld) return reject("NO_TOOL")
  const cost = Math.ceil(GATHER_STAMINA * (warmNow(state, now) ? 1 : 1.5))
  if (state.stamina < cost) return reject("EXHAUSTED")
  const tool = useHeld ? { item: held!, ...heldWorn } : toolAt >= 0 ? state.bag[toolAt]! : null
  const power = tool ? powerOf(tool.item, tool.q) : 1
  const level = lifeLevel(state.life[node.skill])
  const got = yieldOf(node, level, power, command.roll)
  const bag: (Stack | null)[] = [...state.bag]
  let equipment = state.equipment,
    worn = state.worn
  let broke: ItemId | null = null
  if (tool) {
    const dur = (tool.dur ?? 1) - 1
    if (useHeld) {
      if (dur <= 0) {
        broke = tool.item
        equipment = { ...equipment, weapon: null }
        const { weapon: _, ...rest } = worn
        worn = rest
      } else worn = { ...worn, weapon: { ...heldWorn, dur } }
    } else if (dur <= 0) {
      broke = tool.item
      bag[toolAt] = null
    } else bag[toolAt] = { ...(tool as Stack), dur }
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
