import { wearGatheringTool } from "#/world/core/wear-gathering-tool"
// Gathering transition after the dispatcher's recovery and fallen-player checks.
// Node distance and shared stock are checked by the map room before this command.
import { addItem } from "#/world/core/add-item"
import type { ServerCommand } from "./commands"
import { GATHER_STAMINA } from "#/world/core/gather-rules"
import { nodeOf } from "#/world/core/node-of"
import { yieldOf } from "#/world/core/yield-of"
import { ITEMS } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import { GATHER_EXP } from "#/world/core/life-rules"
import { gainLife } from "#/world/core/gain-life"
import { lifeLevel } from "#/world/core/life-level"
import { warmNow } from "#/world/core/warm-now"
import type { PlayerState } from "#/world/core/player-types"
import { gatheringTool } from "./gathering-tool"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

export function gather(state: PlayerState, command: Extract<ServerCommand, { type: "gather" }>, now: number): Transition {
  const node = nodeOf(command.node)
  if (!node) return reject("SPENT")
  const selected = gatheringTool(state, node.skill)
  if (node.needsTool && !selected) return reject("NO_TOOL")
  const cost = Math.ceil(GATHER_STAMINA * (warmNow(state, now) ? 1 : 1.5))
  if (state.stamina < cost) return reject("EXHAUSTED")
  const power = selected?.power ?? 1
  const level = lifeLevel(state.life[node.skill])
  const got = yieldOf({ node, level, power, roll: command.roll })
  const wornTool = wearGatheringTool({ player: state, selected })
  const made = ITEMS[got.item].made ? { q: 1 as Quality, by: state.name } : undefined
  const added = addItem({ bag: wornTool.bag, item: got.item, count: got.count, mark: made })
  if (!added) return reject("BAG_FULL")
  const grown = gainLife(state.life, node.skill, GATHER_EXP)
  return accept(
    { ...state, bag: added, equipment: wornTool.equipment, worn: wornTool.worn, stamina: state.stamina - cost, life: grown.life },
    { type: "gathered", item: got.item, count: got.count, skill: node.skill, level: grown.level, up: grown.up, broke: wornTool.broke },
  )
}
