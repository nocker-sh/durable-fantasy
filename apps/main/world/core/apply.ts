// Run one command against a player's data. Pure: the same input always gives the same result,
// and a refused command never changes anything. The server runs this to decide; the client runs
// it only to grey out what would be refused.
import { handableGold } from "#/world/core/handable-gold"
import { exchangeReady } from "#/world/core/exchange-ready"
import { inventorySelectionMatches } from "#/world/core/inventory-selection"
import { firstOf } from "#/world/core/first-of"
import { moveSlot } from "#/world/core/move-slot"
import { takeFromSlot } from "#/world/core/take-from-slot"
import { receiveItems } from "#/world/core/receive-items"
import { tradeOut } from "#/world/core/trade-out"
import { tradeIn } from "#/world/core/trade-in"
import { store } from "#/world/core/storage/store"
import { retrieve } from "#/world/core/storage/retrieve"
import { consume } from "#/world/core/consume-command"
import { cast } from "#/world/core/cast"
import { payArt } from "#/world/core/pay-art"
import { forgottenLifeExp } from "#/world/core/forgotten-life-exp"
import { keep } from "#/world/core/keep"
import { order } from "#/world/core/commission/order"
import { collect } from "#/world/core/commission/collect"
import type { Command, ServerCommand } from "#/world/core/commands"
import { gather } from "#/world/core/gather-command"
import { equip } from "#/world/core/equip"
import { unequip } from "#/world/core/unequip"
import { settleStats } from "#/world/core/settle-stats"
import { buy } from "#/world/core/buy"
import { sell } from "#/world/core/sell"
import type { ShopContext } from "#/world/core/shop-command-types"
import { takeErrand } from "#/world/core/take-errand"
import { handErrand } from "#/world/core/hand-errand"
import { greet } from "#/world/core/greet"
import { lodge } from "#/world/core/lodge"
import { craft } from "#/world/core/craft-command"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

import { settle as settleHp } from "#/world/core/settle"
import { warmNow } from "#/world/core/warm-now"
import { loot } from "#/world/core/loot"
import { share } from "#/world/core/share"
import { hurt } from "#/world/core/hurt"
import { revive } from "#/world/core/revive"
import { MAX_STAT } from "#/world/core/growth-rules"
import { statCost } from "#/world/core/stat-cost"
import { ITEMS } from "#/world/core/items/catalog"
import { sellable } from "#/world/core/items/sellable"
import type { PlayerState } from "#/world/core/player-types"
import { derive } from "#/world/core/derive"
import { unmet } from "#/world/core/unmet"
import { setProfile } from "#/world/core/set-profile"
import { discard } from "#/world/core/discard"

/**
 * What the server knows when it runs a command: the time (for fullness and warmth), for a
 * purchase the price the shop asks today (market.ts; the list price when not given), and who of
 * the shop's keepers is at the counter now (all of them when not given).
 */
export type Context = ShopContext & {
  now?: number
}

export function apply(before: PlayerState, command: Command | ServerCommand, ctx: Context = {}): Transition {
  const result = applyCommand(before, command, ctx)
  if (!result.ok || !before.allowance || command.type === "trade-out" || command.type === "escrow-buy") return result
  // starting gold is the first spent in town, and what is left of it never exceeds what is held
  const spent = Math.max(0, before.gold - result.state.gold)
  const allowance = Math.max(0, Math.min(result.state.gold, before.allowance - spent))
  return allowance === before.allowance ? result : { ...result, state: { ...result.state, allowance } }
}

function applyCommand(before: PlayerState, command: Command | ServerCommand, ctx: Context): Transition {
  const now = ctx.now ?? 0
  // HP that has come back since it was last counted (the server knows the time; a preview does not)
  const state = ctx.now ? settleHp(before, derive(before), now) : before
  // fallen, there is nothing to do but come to
  if (state.hp <= 0 && command.type !== "revive" && command.type !== "receive" && command.type !== "set-party") return reject("FALLEN")
  if (!inventorySelectionMatches(state, command)) return reject("ITEM_CHANGED")
  switch (command.type) {
    case "buy":
      return buy({ state, command, now, context: ctx })
    case "sell":
      return sell({ state, command, now, context: ctx })
    case "use":
      return consume(state, command.slot, now)
    case "use-item": {
      const index = firstOf(state.bag, command.item)
      if (index < 0) return reject("NOT_OWNED")
      return consume(state, index, now)
    }
    case "gather":
      return gather(state, command, now)
    case "craft":
      return craft(state, command)
    case "order":
      return order(state, command, now)
    case "collect":
      return collect(state, command, now)
    case "errand-take":
      return takeErrand(state, command, now)
    case "errand-hand":
      return handErrand(state, command, now)
    case "lodge":
      return lodge(state, command.shop)
    case "greet":
      return greet(state, command.to, now)
    case "escrow-sell": {
      const slot = state.bag[command.slot]
      if (!slot) return reject("EMPTY_SLOT")
      if (!sellable(slot.item)) return reject("NOT_SELLABLE")
      if (!exchangeReady(slot)) return reject("WORN_TOOL")
      if (state.gold < command.fee) return reject("NO_GOLD")
      const bag = takeFromSlot(state.bag, command.slot, command.qty)
      if (!bag) return reject("NOT_ENOUGH")
      return accept({ ...state, bag, gold: state.gold - command.fee }, { type: "escrowed", item: slot.item, ...(slot.q !== undefined ? { q: slot.q, by: slot.by } : {}), gold: command.fee })
    }
    case "escrow-buy": {
      if (handableGold(state) < command.gold) return reject("NO_GOLD")
      return accept({ ...state, gold: state.gold - command.gold }, { type: "escrowed", item: null, gold: command.gold })
    }
    case "receive":
      return receiveItems(state, command)
    case "loot":
      return loot(state, command)
    case "hurt":
      return hurt(state, command, now)
    case "revive":
      return revive(state, now)
    case "store":
      return store(state, command, now)
    case "retrieve":
      return retrieve(state, command)
    case "trade-out":
      return tradeOut(state, command)
    case "trade-in":
      return tradeIn(state, command)
    case "cast":
      return cast(state, command.skill, now)
    case "art":
      return payArt(state, command.skill, now)
    case "sit":
      return accept({ ...state, sitting: true, hpAt: state.sitting ? state.hpAt : now, spAt: state.sitting ? state.spAt : now }, { type: "sat" })
    case "stand":
      return accept({ ...state, sitting: false, hpAt: state.sitting ? now : state.hpAt, spAt: state.sitting ? now : state.spAt }, { type: "stood" })
    case "thread":
      return accept({ ...state, threads: keep(state.threads, command.thread) }, { type: "threaded", name: command.thread.name })
    case "set-party":
      return accept({ ...state, party: command.party }, { type: "partied", party: command.party })
    case "share":
      return share(state, command)
    case "tire": {
      // the cold outside wears you down half as fast again, unless something warm is in you; too
      // little left and the road is refused, unless it leads nearer town: that one takes what is
      // left (game-system.md §3.6)
      const loss = Math.ceil(command.amount * (warmNow(state, now) ? 1 : 1.5))
      if (state.stamina < loss && !command.homeward) return reject("EXHAUSTED")
      const stamina = Math.max(0, state.stamina - loss)
      return accept({ ...state, stamina }, { type: "tired", stamina })
    }
    case "discard":
      return discard(state, command)
    case "move": {
      const bag = moveSlot(state.bag, command.from, command.to)
      if (!bag) return reject("EMPTY_SLOT")
      return accept({ ...state, bag }, { type: "rearranged" })
    }
    case "equip":
      return equip(state, command.slot, command.to)
    case "unequip":
      return unequip(state, command.slot)
    case "forget-life": {
      const exp = state.life[command.skill]
      if (exp !== command.exp) return reject("LIFE_CHANGED")
      if (exp <= 0) return reject("NO_LIFE_EXP")
      const next = { ...state, life: { ...state.life, [command.skill]: forgottenLifeExp(exp) } }
      if (Object.values(state.equipment).some((id) => id && unmet(ITEMS[id].equip?.needs, next).length)) return reject("LIFE_EQUIPPED")
      return settleStats(next)
    }
    case "raise": {
      const value = state.stats[command.stat]
      if (value >= MAX_STAT) return reject("STAT_MAX")
      const cost = statCost(value)
      if (state.statPoints < cost) return reject("NO_POINTS")
      return accept({ ...state, statPoints: state.statPoints - cost, stats: { ...state.stats, [command.stat]: value + 1 } }, { type: "raised", stat: command.stat, value: value + 1 })
    }
    case "hotbar": {
      const hotbar = state.hotbar.map((id, index) => {
        if (index === command.index) return command.item
        return id === command.item ? null : id
      })
      return accept({ ...state, hotbar }, { type: "rearranged" })
    }
    case "profile":
      return setProfile(state, command, now)
  }
}
