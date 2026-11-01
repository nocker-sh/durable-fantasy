import { addItem } from "#/world/core/add-item"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { ITEMS } from "#/world/core/items/catalog"
import { growCombatPlayer } from "#/world/core/grow-combat-player"
import { FIGHT_STAMINA } from "#/world/core/monsters"
import { accept } from "#/world/core/accept"
import type { Transition } from "#/world/core/transition"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { ItemId } from "#/world/core/items/catalog"

/** 袋に入らない品と持てる重さを超える品は残し、討伐者だけに戦闘のスタミナ消費を反映する。 */
export function loot(state: PlayerState, command: Extract<ServerCommand, { type: "loot" }>): Transition {
  const collected = { bag: state.bag, load: carried(state) }
  const room = derive(state).maxWeight
  const kept: ItemId[] = []
  const left: ItemId[] = []
  for (const item of command.items) {
    const heavier = collected.load + ITEMS[item].weight
    const next = heavier > room && ITEMS[item].weight > 0 ? null : addItem({ bag: collected.bag, item, count: 1 })
    if (next) {
      collected.bag = next
      collected.load = heavier
      kept.push(item)
    } else left.push(item)
  }
  const grown = growCombatPlayer(state, command.exp)

  return accept(
    { ...grown.state, bag: collected.bag, stamina: Math.max(0, state.stamina - FIGHT_STAMINA) },
    { type: "looted", monster: command.monster, exp: grown.exp, items: kept, left: left, level: grown.state.level, gained: grown.gained },
  )
}
