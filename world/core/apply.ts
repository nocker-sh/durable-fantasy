// Run one command against a player's data. Pure: the same input always gives the same result,
// and a refused command never changes anything. The server runs this to decide; the client runs
// it only to grey out what would be refused.
import { addItem, firstOf, moveSlot, putStack, removeItem, takeFromSlot, type Bag, type Stack } from "./bag.ts"
import { STORAGE_KEEPER, STORE_FEE } from "./storage.ts"
import { cast, payArt } from "./skill-command.ts"
import { forgottenLifeExp } from "./life.ts"
import { keep } from "./threads.ts"
import { order, collect } from "./commission-command.ts"
import type { Command, ServerCommand } from "./commands.ts"
import { effectOf, priceOf, qualitiesOf, usualMaker } from "./makers.ts"
import { gather } from "./gather-command.ts"
import { equip, unequip, settleStats } from "./equipment-command.ts"
import { craft } from "./craft-command.ts"
import { accept, reject, type Transition } from "./transition.ts"
export type { Transition } from "./transition.ts"
import { MAX_STAMINA, fullNow, settle as settleHp, warmNow } from "./player.ts"
import { deathPenalty } from "./combat.ts"
import { FRIEND, MAX_ERRANDS, befriend, dayOf, errandOf, errandToday, friendPrice, todays } from "./errands.ts"
import { MAX_STAT, expToNext, gainExp, statCost } from "./growth.ts"
import { FIGHT_STAMINA } from "./monsters.ts"
import { ITEMS, QUALITY_PRICE, sellable, type ItemId, type Quality } from "./items.ts"
import type { PlayerState } from "./player.ts"
import { SHOPS, shopBuys } from "./shops.ts"
import { derive, unmet } from "./stats.ts"

/** Everything carried: the bag and what is worn. */
export function carried(state: Pick<PlayerState, "bag" | "equipment">): number {
  let total = 0
  for (const s of state.bag) if (s) total += ITEMS[s.item].weight * s.count
  for (const id of Object.values(state.equipment)) if (id) total += ITEMS[id].weight
  return total
}

/**
 * What the server knows when it runs a command: the time (for fullness and warmth), for a
 * purchase the price the shop asks today (market.ts; the list price when not given), and who of
 * the shop's keepers is at the counter now (all of them when not given).
 */
export interface Context {
  now?: number
  price?: number
  keepers?: readonly string[]
}

/** The maker of a shop's made things: named in the shop, or else the usual one. */
export const makerAt = (shop: keyof typeof SHOPS, item: ItemId) => (SHOPS[shop] as { makers?: Partial<Record<ItemId, string>> }).makers?.[item] ?? usualMaker(item)

/** How well the shop's people know the player: the friendliest of its keepers. */
export const shopFriend = (state: Pick<PlayerState, "friends">, shop: keyof typeof SHOPS) => Math.max(0, ...SHOPS[shop].keepers.map((k) => state.friends[k] ?? 0))

/** Doing business with someone: a little more friendship, once a day each (the day is kept in boughtOn). */
function dealtWith(state: PlayerState, names: readonly string[], now: number) {
  const today = dayOf(now)
  let friends = state.friends,
    boughtOn = state.boughtOn
  for (const k of names)
    if (boughtOn[k] !== today) {
      friends = befriend(friends, k, FRIEND.bought)
      boughtOn = { ...boughtOn, [k]: today }
    }
  return { friends, boughtOn }
}

export function apply(before: PlayerState, command: Command | ServerCommand, ctx: Context = {}): Transition {
  const now = ctx.now ?? 0
  // HP that has come back since it was last counted (the server knows the time; a preview does not)
  const state = ctx.now ? settleHp(before, derive(before), now) : before
  // fallen, there is nothing to do but come to
  if (state.hp <= 0 && command.type !== "revive" && command.type !== "receive" && command.type !== "set-party") return reject("FALLEN")
  switch (command.type) {
    case "buy": {
      const shop = SHOPS[command.shop]
      if (!(shop.stock as readonly string[]).includes(command.item)) return reject("NOT_SOLD_HERE")
      const made = ITEMS[command.item].made
      const by = made ? makerAt(command.shop, command.item) : undefined
      const q: Quality = command.q ?? 1
      if (made && !qualitiesOf(command.item, by).includes(q)) return reject("NOT_SOLD_HERE")
      const cost = friendPrice(ctx.price ?? priceOf(command.item, q, by), shopFriend(state, command.shop)) * command.count
      if (state.gold < cost) return reject("NO_GOLD")
      if (carried(state) + ITEMS[command.item].weight * command.count > derive(state).maxWeight) return reject("TOO_HEAVY")
      const bag = addItem(state.bag, command.item, command.count, made ? { q, by } : undefined)
      if (!bag) return reject("BAG_FULL")
      // buying from someone makes you a little more known to them, once a day: whoever is on duty
      const { friends, boughtOn } = dealtWith(state, ctx.keepers ?? shop.keepers, now)
      return accept({ ...state, gold: state.gold - cost, bag, friends, boughtOn }, { type: "bought", item: command.item, count: command.count, cost, ...(by ? { by } : {}) })
    }
    case "sell": {
      const slot = state.bag[command.slot]
      if (!slot) return reject("EMPTY_SLOT")
      if (!sellable(slot.item)) return reject("NOT_SELLABLE")
      const bag = takeFromSlot(state.bag, command.slot, command.count)
      if (!bag) return reject("NOT_ENOUGH")
      // the shop's price now (market.ts), or the list price when the room did not ask
      const each = ctx.price !== undefined ? (ITEMS[slot.item].made ? Math.max(1, Math.floor(ctx.price * QUALITY_PRICE[slot.q ?? 1])) : ctx.price) : sellsFor(command.shop, slot)
      const gain = each * command.count
      // the buyer gets to know who keeps bringing them things, once a day
      const known = SHOPS[command.shop].kind === "buyer" ? dealtWith(state, ctx.keepers ?? SHOPS[command.shop].keepers, now) : state
      return accept({ ...state, gold: state.gold + gain, bag, friends: known.friends, boughtOn: known.boughtOn }, { type: "sold", item: slot.item, count: command.count, gain })
    }
    case "use": {
      const slot = state.bag[command.slot]
      if (!slot) return reject("EMPTY_SLOT")
      return use(state, slot, takeFromSlot(state.bag, command.slot, 1), now)
    }
    case "use-item": {
      const index = firstOf(state.bag, command.item)
      if (index < 0) return reject("NOT_OWNED")
      return use(state, state.bag[index]!, takeFromSlot(state.bag, index, 1), now)
    }
    case "gather":
      return gather(state, command, now)
    case "craft":
      return craft(state, command)
    case "order":
      return order(state, command, now)
    case "collect":
      return collect(state, command, now)
    case "errand-take": {
      const e = errandOf(command.errand)
      const list = todays(state.errands, now)
      if (!e || e.from !== command.from || errandToday(e.from, dayOf(now))?.id !== e.id || list.some((t) => t.id === e.id)) return reject("NO_ERRAND")
      if (list.filter((t) => !t.done).length >= MAX_ERRANDS) return reject("TOO_MANY_ERRANDS")
      return accept({ ...state, errands: [...list, { id: e.id, day: dayOf(now), done: false }] }, { type: "errand-taken", errand: e.id })
    }
    case "errand-hand": {
      const e = errandOf(command.errand)
      const list = todays(state.errands, now)
      if (!e || !list.some((t) => t.id === e.id && !t.done)) return reject("NO_ERRAND")
      if (command.to !== (e.kind === "bring" ? e.from : e.to)) return reject("NO_ERRAND")
      let bag: Bag = state.bag
      if (e.wants) {
        const next = removeItem(bag, e.wants.item, e.wants.count)
        if (!next) return reject("NOT_ENOUGH")
        bag = next
      }
      let friends = befriend(state.friends, e.from, e.kind === "bring" ? FRIEND.bring : FRIEND.deliver)
      if (e.to) friends = befriend(friends, e.to, FRIEND.received)
      const changed = Object.fromEntries([e.from, ...(e.to ? [e.to] : [])].map((n) => [n, friends[n]]))
      return accept(
        { ...state, bag, gold: state.gold + e.gold, friends, errands: list.map((t) => (t.id === e.id ? { ...t, done: true } : t)) },
        { type: "errand-done", errand: e.id, gold: e.gold, friends: changed },
      )
    }
    case "escrow-sell": {
      const slot = state.bag[command.slot]
      if (!slot) return reject("EMPTY_SLOT")
      if (!sellable(slot.item) || ITEMS[slot.item].tool) return reject("NOT_SELLABLE")
      if (state.gold < command.fee) return reject("NO_GOLD")
      const bag = takeFromSlot(state.bag, command.slot, command.qty)
      if (!bag) return reject("NOT_ENOUGH")
      return accept({ ...state, bag, gold: state.gold - command.fee }, { type: "escrowed", item: slot.item, ...(slot.q !== undefined ? { q: slot.q, by: slot.by } : {}), gold: command.fee })
    }
    case "escrow-buy": {
      if (state.gold < command.gold) return reject("NO_GOLD")
      return accept({ ...state, gold: state.gold - command.gold }, { type: "escrowed", item: null, gold: command.gold })
    }
    case "receive": {
      let bag: Bag = state.bag
      for (const it of command.items) {
        const next = addItem(bag, it.item, it.count, it.q !== undefined ? { q: it.q, by: it.by } : undefined)
        if (!next) return reject("BAG_FULL")
        bag = next
      }
      return accept({ ...state, bag, gold: state.gold + command.gold }, { type: "received", gold: command.gold, items: command.items.reduce((a, i) => a + i.count, 0) })
    }
    case "loot": {
      // what does not fit is left in the grass
      let bag: Bag = state.bag
      const kept: ItemId[] = []
      for (const item of command.items) {
        const next = addItem(bag, item, 1)
        if (next) {
          bag = next
          kept.push(item)
        }
      }
      const grown = gainExp(state, command.exp)
      const d = derive({ ...state, level: grown.level })
      return accept(
        {
          ...state,
          bag,
          level: grown.level,
          exp: grown.exp,
          statPoints: grown.statPoints,
          stamina: Math.max(0, state.stamina - FIGHT_STAMINA),
          hp: grown.gained ? d.maxHp : state.hp,
          sp: grown.gained ? d.maxSp : state.sp,
        },
        { type: "looted", monster: command.monster, exp: command.exp, items: kept, level: grown.level, gained: grown.gained },
      )
    }
    case "hurt": {
      const hp = Math.max(0, state.hp - command.amount)
      return accept(
        { ...state, hp, hpAt: state.hp >= derive(state).maxHp ? now : state.hpAt, sitting: false },
        hp > 0 ? { type: "hurt", amount: command.amount, by: command.by, hp } : { type: "fell", by: command.by },
      )
    }
    case "revive": {
      if (state.hp > 0) return reject("NOT_FALLEN")
      const lost = Math.min(state.exp, deathPenalty(state.level, expToNext(state.level)))
      const hp = Math.max(1, Math.floor(derive(state).maxHp / 2))
      return accept({ ...state, hp, hpAt: now, sitting: false, exp: state.exp - lost }, { type: "revived", hp, lost })
    }
    case "store": {
      const slot = state.bag[command.slot]
      if (!slot) return reject("EMPTY_SLOT")
      if (ITEMS[slot.item].kind === "key") return reject("NOT_STORABLE")
      if (state.gold < STORE_FEE) return reject("NO_GOLD")
      const bag = takeFromSlot(state.bag, command.slot, command.count)
      if (!bag) return reject("NOT_ENOUGH")
      const storage = putStack(state.storage, { ...slot, count: command.count })
      if (!storage) return reject("STORAGE_FULL")
      // Hilde gets to know whose shelf it is, once a day
      const { friends, boughtOn } = dealtWith(state, [STORAGE_KEEPER], now)
      return accept(
        { ...state, bag, storage, gold: state.gold - STORE_FEE, friends, boughtOn },
        { type: "stored", item: slot.item, count: command.count, fee: STORE_FEE, ...(slot.by ? { by: slot.by } : {}) },
      )
    }
    case "retrieve": {
      const lot = state.storage[command.index]
      if (!lot) return reject("EMPTY_SLOT")
      const storage = takeFromSlot(state.storage, command.index, command.count)
      if (!storage) return reject("NOT_ENOUGH")
      if (carried(state) + ITEMS[lot.item].weight * command.count > derive(state).maxWeight) return reject("TOO_HEAVY")
      const bag = putStack(state.bag, { ...lot, count: command.count })
      if (!bag) return reject("BAG_FULL")
      return accept({ ...state, bag, storage }, { type: "retrieved", item: lot.item, count: command.count, ...(lot.by ? { by: lot.by } : {}) })
    }
    case "trade-out": {
      const { lots, gold } = command.offer
      if (!Number.isInteger(gold) || gold < 0 || gold > state.gold) return reject("NO_GOLD")
      if (new Set(lots.map((l) => l.slot)).size !== lots.length) return reject("NOT_ENOUGH")
      let bag: Bag = state.bag
      const stacks: Stack[] = []
      for (const { slot, count } of lots) {
        const s = state.bag[slot]
        if (!s) return reject("EMPTY_SLOT")
        if (ITEMS[s.item].kind === "key") return reject("NOT_TRADABLE")
        const next = takeFromSlot(bag, slot, count)
        if (!next) return reject("NOT_ENOUGH")
        bag = next
        stacks.push({ ...s, count })
      }
      return accept({ ...state, bag, gold: state.gold - gold }, { type: "traded-out", stacks, gold })
    }
    case "trade-in": {
      let bag: Bag = state.bag
      for (const s of command.stacks) {
        const next = putStack(bag, s)
        if (!next) return reject("BAG_FULL")
        bag = next
      }
      const weight = carried({ bag, equipment: state.equipment })
      if (command.stacks.length && weight > derive(state).maxWeight) return reject("TOO_HEAVY")
      return accept({ ...state, bag, gold: state.gold + command.gold }, { type: "traded-in", stacks: [...command.stacks], gold: command.gold })
    }
    case "cast":
      return cast(state, command.skill, now)
    case "art":
      return payArt(state, command.skill, now)
    case "sit":
      return accept({ ...state, sitting: true }, { type: "sat" })
    case "stand":
      return accept({ ...state, sitting: false }, { type: "stood" })
    case "thread":
      return accept({ ...state, threads: keep(state.threads, command.thread) }, { type: "threaded", name: command.thread.name })
    case "set-party":
      return accept({ ...state, party: command.party }, { type: "partied", party: command.party })
    case "share": {
      const grown = gainExp(state, command.exp)
      const d = derive({ ...state, level: grown.level })
      return accept(
        { ...state, level: grown.level, exp: grown.exp, statPoints: grown.statPoints, hp: grown.gained ? d.maxHp : state.hp, sp: grown.gained ? d.maxSp : state.sp },
        { type: "shared", monster: command.monster, exp: command.exp, level: grown.level, gained: grown.gained },
      )
    }
    case "tire": {
      // the cold outside wears you down half as fast again, unless something warm is in you
      const loss = Math.ceil(command.amount * (warmNow(state, now) ? 1 : 1.5))
      if (state.stamina <= 0) return reject("EXHAUSTED")
      const stamina = Math.max(0, state.stamina - loss)
      return accept({ ...state, stamina }, { type: "tired", stamina })
    }
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
      return accept({ ...state, profileComplete: true, name: command.name, look: command.look, neck: command.neck, neckRamp: command.neckRamp }, { type: "renamed", name: command.name })
  }
}

/** What a shop pays for one of these: its quality counts for made things. */
export function sellsFor(shop: keyof typeof SHOPS, slot: Stack): number {
  const base = shopBuys(shop, slot.item)
  return ITEMS[slot.item].made ? Math.max(1, Math.floor(base * QUALITY_PRICE[slot.q ?? 1])) : base
}

function use(state: PlayerState, slot: Stack, bag: Bag | null, now: number): Transition {
  const item = slot.item
  if (!ITEMS[item].use) return reject("NOT_USABLE")
  const e = effectOf(item, slot.q ?? 1, slot.by)
  const d = derive(state)
  const full = fullNow(state, now)
  if (e.full > 0 && full + e.full > 100) return reject("TOO_FULL")
  const wantsHp = e.hp > 0 && state.hp < d.maxHp,
    wantsSp = e.sp > 0 && state.sp < d.maxSp
  const wantsStamina = e.stamina > 0 && state.stamina < MAX_STAMINA
  const food = e.full > 0 || e.warm > 0 || e.focus > 0
  if (!wantsHp && !wantsSp && !wantsStamina && !(food && (e.warm > 0 || e.focus > 0))) return reject(food ? "NOTHING_TO_GAIN" : e.sp && !e.hp ? "SP_FULL" : "HP_FULL")
  if (!bag) return reject("NOT_OWNED")
  const hp = Math.min(d.maxHp, state.hp + e.hp)
  const sp = Math.min(d.maxSp, state.sp + e.sp)
  const stamina = Math.min(MAX_STAMINA, state.stamina + e.stamina)
  const warmUntil = e.warm > 0 ? Math.max(state.warmUntil, now + e.warm * 60_000) : state.warmUntil
  const focusUntil = e.focus > 0 ? Math.max(state.focusUntil, now + e.focus * 60_000) : state.focusUntil
  const focusAt = e.focus > 0 && state.focusUntil <= now ? now : state.focusAt
  return accept(
    { ...state, hp, sp, stamina, focusAt, focusUntil, full: e.full > 0 ? full + e.full : state.full, fullAt: e.full > 0 ? now : state.fullAt, warmUntil, bag },
    { type: "used", item, hp: hp - state.hp, sp: sp - state.sp, stamina: stamina - state.stamina, warm: e.warm, ...(e.focus > 0 ? { focus: e.focus } : {}), ...(slot.by ? { by: slot.by } : {}) },
  )
}
