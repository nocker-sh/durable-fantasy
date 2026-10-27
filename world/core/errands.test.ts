import { loadPlayer } from "./player.ts"
import { describe, expect, it } from "vitest"
import { apply } from "./apply.ts"
import { countItem } from "./bag.ts"
import { RECIPES } from "./crafting.ts"
import { DAY_TURNS, ERRANDS, FRIEND, MAX_ERRANDS, dayOf, errandToday, errandsOn, friendPrice } from "./errands.ts"
import { NODES } from "./gather.ts"
import { ITEMS, sellPrice } from "./items.ts"
import { MONSTER_KINDS } from "./monsters.ts"
import { MAPS, npcCell } from "../maps/index.ts"
import { RESIDENTS } from "../town/residents.ts"
import { SHOPS } from "./shops.ts"
import { STORAGE_KEEPER } from "./storage.ts"
import { bagWith, player } from "../test/helpers.ts"

const DAY0 = Date.parse("2026-10-21T03:00:00Z") // noon in Japan
const D = 86_400_000
const names = new Set(RESIDENTS.map((r) => r.name))

/** A day on which this resident asks this errand. */
function dayOfErrand(id: string): number {
  for (let k = 0; k < 400; k++) {
    const t = DAY0 + k * D
    const e = ERRANDS.find((x) => x.id === id)!
    if (errandToday(e.from, dayOf(t))?.id === id) return t
  }
  throw new Error(`${id} is never asked`)
}

describe("errands", () => {
  it("are asked by residents, of things that can be had, and taken to residents", () => {
    const obtainable = new Set<string>([
      ...NODES.flatMap((n) => n.yields.map((y) => y.item)),
      ...RECIPES.map((r) => r.output.item),
      ...Object.values(MONSTER_KINDS).flatMap((k) => k.drops.map((d) => d.item)),
      ...Object.values(SHOPS).flatMap((s) => s.stock as readonly string[]),
    ])
    for (const e of ERRANDS) {
      expect(names.has(e.from), e.id).toBe(true)
      if (e.to) expect(names.has(e.to), e.id).toBe(true)
      if (e.wants) expect(obtainable.has(e.wants.item), e.id).toBe(true)
      expect(e.ask.length && e.thanks.length && e.gold > 0, e.id).toBeTruthy()
    }
  })

  it("buying the things to hand over never pays; gathering them pays more than selling them to a shop", () => {
    for (const e of ERRANDS.filter((x) => x.wants)) {
      const value = ITEMS[e.wants!.item].price * e.wants!.count
      expect(e.gold, e.id).toBeLessThanOrEqual(value)
      expect(e.gold, e.id).toBeGreaterThan(sellPrice(e.wants!.item) * e.wants!.count)
    }
  })

  it("everyone involved is out and about at some hour, so they can be found", () => {
    for (const name of new Set(ERRANDS.flatMap((e) => [e.from, ...(e.to ? [e.to] : [])]))) {
      const found = Array.from({ length: 96 }, (_, i) => i * 15).some((min) => Object.values(MAPS).some((m) => npcCell(m, name, min)))
      expect(found, name).toBe(true)
    }
  })

  it("can be done within the day: asked while the asker is out, handed over later the same errand day", () => {
    const out = (name: string, min: number) => Object.values(MAPS).some((m) => npcCell(m, name, min % 1440))
    // minutes counted from when the errand day turns over
    const steps = Array.from({ length: 96 }, (_, i) => DAY_TURNS + i * 15)
    for (const e of ERRANDS) {
      const hand = e.kind === "bring" ? e.from : e.to!
      const ok = steps.some((a, i) => out(e.from, a) && steps.slice(i + 1).some((b) => out(hand, b)))
      expect(ok, e.id).toBe(true)
    }
  })

  it("the same requests for everyone on a day, a fair number of them, and every errand comes up", () => {
    expect(errandsOn("2026-10-21")).toEqual(errandsOn("2026-10-21"))
    for (let k = 0; k < 30; k++) {
      const n = errandsOn(new Date(DAY0 + k * D).toISOString().slice(0, 10)).length
      expect(n).toBeGreaterThanOrEqual(4)
      expect(n).toBeLessThanOrEqual(18)
    }
    for (const e of ERRANDS) expect(() => dayOfErrand(e.id)).not.toThrow()
  })

  it("bring: take it, hand the things over, get paid and known", () => {
    const now = dayOfErrand("irmgard-herbs")
    const p = player({ bag: bagWith(["blue-herb", 3]) })
    const taken = apply(p, { type: "errand-take", errand: "irmgard-herbs", from: "イルムガルト" }, { now })
    expect(taken.ok).toBe(true)
    if (!taken.ok) return
    expect(apply(taken.state, { type: "errand-take", errand: "irmgard-herbs", from: "イルムガルト" }, { now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(apply(taken.state, { type: "errand-hand", errand: "irmgard-herbs", to: "ゲルダ" }, { now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    const done = apply(taken.state, { type: "errand-hand", errand: "irmgard-herbs", to: "イルムガルト" }, { now })
    expect(done.ok).toBe(true)
    if (!done.ok) return
    expect(countItem(done.state.bag, "blue-herb")).toBe(1)
    expect(done.state.gold).toBe(p.gold + ERRANDS.find((e) => e.id === "irmgard-herbs")!.gold)
    expect(done.state.friends["イルムガルト"]).toBe(FRIEND.bring)
    expect(apply(done.state, { type: "errand-hand", errand: "irmgard-herbs", to: "イルムガルト" }, { now })).toEqual({ ok: false, reason: "NO_ERRAND" })
  })

  it("turns recovered scrap into smith work, pays once, and keeps surplus material", () => {
    const id = "gunter-scrap"
    const now = dayOfErrand(id)
    const p = player({ bag: bagWith(["rusty-scrap", 2]) })
    const taken = apply(p, { type: "errand-take", errand: id, from: "ギュンター" }, { now })
    expect(taken.ok).toBe(true)
    if (!taken.ok) return
    const hand = { type: "errand-hand", errand: id, to: "ギュンター" } as const
    expect(apply(taken.state, hand, { now })).toEqual({ ok: false, reason: "NOT_ENOUGH" })
    const done = apply({ ...taken.state, bag: bagWith(["rusty-scrap", 4]) }, hand, { now })
    expect(done.ok).toBe(true)
    if (!done.ok) return
    expect(countItem(done.state.bag, "rusty-scrap")).toBe(1)
    expect(done.state.gold).toBe(p.gold + ERRANDS.find((e) => e.id === id)!.gold)
    expect(done.state.friends["ギュンター"]).toBe(FRIEND.bring)
    expect(done.state.errands.find((e) => e.id === id)?.done).toBe(true)
    expect(apply(done.state, hand, { now })).toEqual({ ok: false, reason: "NO_ERRAND" })
  })

  it("bring without enough of the thing is refused and nothing changes", () => {
    const now = dayOfErrand("irmgard-herbs")
    const t = apply(player({ bag: bagWith(["blue-herb", 1]) }), { type: "errand-take", errand: "irmgard-herbs", from: "イルムガルト" }, { now })
    expect(t.ok && apply(t.state, { type: "errand-hand", errand: "irmgard-herbs", to: "イルムガルト" }, { now })).toEqual({ ok: false, reason: "NOT_ENOUGH" })
  })

  it("deliver: carried to the other resident; both know you a little better", () => {
    const now = dayOfErrand("jakob-fish")
    const t = apply(player(), { type: "errand-take", errand: "jakob-fish", from: "ヤコブ" }, { now })
    expect(t.ok && apply(t.state, { type: "errand-hand", errand: "jakob-fish", to: "ヤコブ" }, { now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    const done = t.ok ? apply(t.state, { type: "errand-hand", errand: "jakob-fish", to: "フランツ" }, { now }) : t
    expect(done.ok && done.state.friends).toEqual({ ヤコブ: FRIEND.deliver, フランツ: FRIEND.received })
  })

  it("only today's, only the one they ask, and at most three at once", () => {
    const now = dayOfErrand("irmgard-herbs")
    expect(apply(player(), { type: "errand-take", errand: "irmgard-jelly", from: "イルムガルト" }, { now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    const t = apply(player(), { type: "errand-take", errand: "irmgard-herbs", from: "イルムガルト" }, { now })
    // the next day it has lapsed
    expect(t.ok && apply(t.state, { type: "errand-hand", errand: "irmgard-herbs", to: "イルムガルト" }, { now: now + D })).toEqual({ ok: false, reason: "NO_ERRAND" })
    const today = errandsOn(dayOf(now))
    let p = player()
    for (const e of today.slice(0, MAX_ERRANDS)) {
      const r = apply(p, { type: "errand-take", errand: e.id, from: e.from }, { now })
      if (r.ok) p = r.state
    }
    const extra = today[MAX_ERRANDS]
    if (extra) expect(apply(p, { type: "errand-take", errand: extra.id, from: extra.from }, { now })).toEqual({ ok: false, reason: "TOO_MANY_ERRANDS" })
  })

  it("friends pay less: 1% off for every 10, at most 10%; buying makes you known once a day", () => {
    expect(friendPrice(100, 0)).toBe(100)
    expect(friendPrice(100, 55)).toBe(95)
    expect(friendPrice(100, 100)).toBe(90)
    const p = player({ gold: 500, friends: { イルムガルト: 50 } })
    const r = apply(p, { type: "buy", shop: "apothecary", item: "herb", count: 1 }, { now: DAY0, price: 100 })
    expect(r.ok && r.state.gold).toBe(405)
    const again = r.ok ? apply(r.state, { type: "buy", shop: "apothecary", item: "herb", count: 1 }, { now: DAY0 + 60_000, price: 100 }) : r
    expect(again.ok && again.state.friends["イルムガルト"]).toBe(50 + FRIEND.bought)
  })

  it("only the keeper on duty gets to know you from a purchase; all of them when the room does not say", () => {
    const night = apply(player({ gold: 500 }), { type: "buy", shop: "general", item: "herb", count: 1 }, { now: DAY0, keepers: ["ブルーノ"] })
    expect(night.ok && night.state.friends).toEqual({ ブルーノ: FRIEND.bought })
    const preview = apply(player({ gold: 500 }), { type: "buy", shop: "general", item: "herb", count: 1 }, { now: DAY0 })
    expect(preview.ok && preview.state.friends).toEqual({ ブルーノ: FRIEND.bought, ヘレナ: FRIEND.bought })
  })

  it("selling to the buyer and leaving things with Hilde make you known, once a day each", () => {
    const p = player({ gold: 100, bag: bagWith(["jelly", 5]) })
    const sold = apply(p, { type: "sell", shop: "buyer", slot: 0, count: 1 }, { now: DAY0 })
    const again = sold.ok ? apply(sold.state, { type: "sell", shop: "buyer", slot: 0, count: 1 }, { now: DAY0 + 60_000 }) : sold
    expect(again.ok && again.state.friends["ラインホルト"]).toBe(FRIEND.bought)
    const stored = again.ok ? apply(again.state, { type: "store", slot: 0, count: 1 }, { now: DAY0 }) : again
    const twice = stored.ok ? apply(stored.state, { type: "store", slot: 0, count: 1 }, { now: DAY0 + 60_000 }) : stored
    expect(twice.ok && twice.state.friends[STORAGE_KEEPER]).toBe(FRIEND.bought)
    const nextDay = twice.ok ? apply(twice.state, { type: "store", slot: 0, count: 1 }, { now: DAY0 + D }) : twice
    expect(nextDay.ok && nextDay.state.friends[STORAGE_KEEPER]).toBe(2 * FRIEND.bought)
    // other shops buying back is just trade
    const food = apply(player({ bag: bagWith(["herb", 1]) }), { type: "sell", shop: "general", slot: 0, count: 1 }, { now: DAY0 })
    expect(food.ok && food.state.friends).toEqual({})
  })
})

it("delivers player-smelted iron to the armorer once and preserves the completed request", () => {
  const id = "beatrix-ingots"
  const now = dayOfErrand(id)
  const request = ERRANDS.find((e) => e.id === id)!
  let state = player({ name: "エルナ", gold: 100, bag: bagWith(["rusty-scrap", 4], ["charcoal", 2]) })
  const accepted = apply(state, { type: "errand-take", errand: id, from: request.from }, { now })
  if (!accepted.ok) throw Error(accepted.reason)
  state = accepted.state
  for (let i = 0; i < 2; i++) {
    const made = apply(state, { type: "craft", recipe: "iron-ingot", station: "craft-forge", roll: 0.5 }, { now })
    if (!made.ok) throw Error(made.reason)
    state = made.state
  }
  expect(countItem(state.bag, "iron-ingot")).toBe(2)
  const before = state
  const handed = apply(state, { type: "errand-hand", errand: id, to: request.from }, { now })
  if (!handed.ok) throw Error(handed.reason)
  expect(countItem(handed.state.bag, "iron-ingot")).toBe(0)
  expect(handed.state.gold).toBe(before.gold + request.gold)
  expect(handed.state.friends[request.from]).toBe(FRIEND.bring)
  const saved = loadPlayer(JSON.parse(JSON.stringify(handed.state)))
  expect(apply(saved, { type: "errand-hand", errand: id, to: request.from }, { now })).toEqual({ ok: false, reason: "NO_ERRAND" })
})
