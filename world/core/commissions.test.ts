import { describe, expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import type { Bag } from "#/world/core/bag-types"
import { COMMISSIONS } from "#/world/core/commissions"
import { MAX_ORDERS } from "#/world/core/commission-rules"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { RESIDENTS } from "#/world/town/residents"
import { derive } from "#/world/core/derive"
import { loadPlayer } from "#/world/core/load-player"
import { player } from "#/world/test/player"

const bag = (...items: [ItemId, number][]): Bag => items.reduce<Bag>((b, [id, n]) => addItem({ bag: b, item: id, count: n })!, emptyBag())
const H = 3_600_000

describe("commissions", () => {
  it("buys hides, tans leather, then commissions armor without using loose fur", () => {
    let state = player({ gold: 500 })
    const buy = apply(state, { type: "buy", shop: "leather", item: "raw-hide", count: 4 })
    expect(buy.ok).toBe(true)
    if (!buy.ok) return
    state = buy.state
    for (let i = 0; i < 2; i++) {
      const order = apply(state, { type: "order", commission: "rudolf-leather", roll: 0.5 }, { now: 0 })
      expect(order.ok).toBe(true)
      if (!order.ok) return
      state = order.state
    }
    expect(countItem(state.bag, "raw-hide")).toBe(0)
    expect(apply(state, { type: "collect", index: 0, expectedOrders: state.orders }, { now: H })).toEqual({ ok: false, reason: "NOT_READY" })
    for (let i = 0; i < 2; i++) {
      const collect = apply(state, { type: "collect", index: 0, expectedOrders: state.orders }, { now: 2 * H })
      expect(collect.ok).toBe(true)
      if (!collect.ok) return
      state = collect.state
    }
    expect(countItem(state.bag, "tanned-leather")).toBe(4)
    const armor = apply(state, { type: "order", commission: "rudolf-armor", roll: 0.5 }, { now: 2 * H })
    expect(armor.ok).toBe(true)
    if (!armor.ok) return
    expect(countItem(armor.state.bag, "tanned-leather")).toBe(0)
    const ready = apply(armor.state, { type: "collect", index: 0, expectedOrders: armor.state.orders }, { now: 5 * H })
    expect(ready.ok && countItem(ready.state.bag, "leather-armor")).toBe(1)
    expect(armor.state.gold).toBe(326)
    expect(500 - armor.state.gold).toBeLessThan(ITEMS["leather-armor"].price)
    expect(apply(player({ gold: 500, bag: bag(["soft-fur", 4]) }), { type: "order", commission: "rudolf-armor", roll: 0.5 })).toEqual({ ok: false, reason: "MISSING_INPUTS" })
  })

  it("still delivers armor ordered before the material change", () => {
    const waiting = player({ orders: [{ commission: "rudolf-armor", readyAt: H, q: 1 }] })
    const result = apply(waiting, { type: "collect", index: 0, expectedOrders: waiting.orders }, { now: H })
    expect(result.ok && countItem(result.state.bag, "leather-armor")).toBe(1)
  })

  it("takes the iron and the fee now, and the sword is ready in two hours", () => {
    const p = player({ gold: 200, bag: bag(["iron-ingot", 3]) })
    const r = apply(p, { type: "order", commission: "gunter-sword", roll: 0.5 }, { now: 0 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(countItem(r.state.bag, "iron-ingot")).toBe(0)
    expect(r.state.gold).toBe(80)
    expect(apply(r.state, { type: "collect", index: 0, expectedOrders: r.state.orders }, { now: H })).toEqual({ ok: false, reason: "NOT_READY" })
    const got = apply(r.state, { type: "collect", index: 0, expectedOrders: r.state.orders }, { now: 2 * H })
    expect(got.ok && countItem(got.state.bag, "iron-sword")).toBe(1)
    expect(got.ok && got.state.orders).toHaveLength(0)
  })

  it("a made thing comes with the craftsman's name and their quality", () => {
    const p = player({ gold: 200, bag: bag(["herb", 10], ["jelly", 2]) })
    const r = apply(p, { type: "order", commission: "irmgard-potions", roll: 0.5 }, { now: 0 })
    const got = r.ok ? apply(r.state, { type: "collect", index: 0, expectedOrders: r.state.orders }, { now: H }) : r
    expect(got.ok && got.state.bag.find((s) => s?.item === "potion")).toMatchObject({ by: "イルムガルト", count: 5 })
  })

  it.each(["rudolf-armor", "beatrix-mail"])("retains commissioned armor quality through saving, equipment and removal: %s", (id) => {
    const job = COMMISSIONS.find((job) => job.id === id)!
    const base = player()
    const p = player({ gold: 1000, stats: { ...base.stats, str: 12, vit: 12 }, bag: bag(...job.inputs.map((input) => [input.item, input.count] as [ItemId, number])) })
    const ordered = apply(p, { type: "order", commission: id, roll: 0.8 }, { now: 0 })
    if (!ordered.ok) throw Error(ordered.reason)
    expect(ordered.state.orders[0].q).toBe(2)
    const collected = apply(
      loadPlayer(JSON.parse(JSON.stringify(ordered.state))),
      { type: "collect", index: 0, expectedOrders: loadPlayer(JSON.parse(JSON.stringify(ordered.state))).orders },
      { now: job.minutes * 60_000 },
    )
    if (!collected.ok) throw Error(collected.reason)
    const slot = collected.state.bag.findIndex((s) => s?.item === job.output.item)
    expect(collected.state.bag[slot]).toMatchObject({ item: job.output.item, q: 2, by: job.craftsman })
    const equipped = apply(collected.state, { type: "equip", slot })
    if (!equipped.ok) throw Error(equipped.reason)
    const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
    expect(saved.worn.body).toEqual({ q: 2, by: job.craftsman })
    const ordinary = { ...saved, worn: { ...saved.worn, body: { q: 1 as const, by: job.craftsman } } }
    expect(derive(saved).def).toBeGreaterThan(derive(ordinary).def)
    const removed = apply(saved, { type: "unequip", slot: "body" })
    if (!removed.ok) throw Error(removed.reason)
    expect(removed.state.bag).toContainEqual({ item: job.output.item, count: 1, q: 2, by: job.craftsman })
  })

  it("turns bought leather into boots and preserves their maker and quality when worn", () => {
    const bought = apply(player({ gold: 100 }), { type: "buy", shop: "leather", item: "tanned-leather", count: 1 })
    if (!bought.ok) throw Error(bought.reason)
    const ordered = apply(bought.state, { type: "order", commission: "rudolf-boots", roll: 0.8 }, { now: 0 })
    if (!ordered.ok) throw Error(ordered.reason)
    expect(countItem(ordered.state.bag, "tanned-leather")).toBe(0)
    expect(ordered.state.gold).toBe(100 - ITEMS["tanned-leather"].price - 12)
    expect(apply(ordered.state, { type: "collect", index: 0, expectedOrders: ordered.state.orders }, { now: H - 1 })).toEqual({ ok: false, reason: "NOT_READY" })
    const collected = apply(
      loadPlayer(JSON.parse(JSON.stringify(ordered.state))),
      { type: "collect", index: 0, expectedOrders: loadPlayer(JSON.parse(JSON.stringify(ordered.state))).orders },
      { now: H },
    )
    if (!collected.ok) throw Error(collected.reason)
    const slot = collected.state.bag.findIndex((entry) => entry?.item === "leather-boots")
    const equipped = apply(collected.state, { type: "equip", slot })
    if (!equipped.ok) throw Error(equipped.reason)
    const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
    expect(saved.equipment.feet).toBe("leather-boots")
    expect(saved.worn.feet).toEqual({ q: 2, by: "ルドルフ" })
    expect(derive(saved).def - derive(collected.state).def).toBe(1)
    const removed = apply(saved, { type: "unequip", slot: "feet" })
    if (!removed.ok) throw Error(removed.reason)
    expect(removed.state.bag).toContainEqual({ item: "leather-boots", count: 1, q: 2, by: "ルドルフ" })
  })

  it("commissions the chapel charm and preserves its maker in an accessory slot", () => {
    const ordered = apply(player({ gold: 100, bag: bag(["plank", 1], ["yarn", 1]) }), { type: "order", commission: "benedict-charm", roll: 0.5 }, { now: 0 })
    if (!ordered.ok) throw Error(ordered.reason)
    expect(ordered.state.gold).toBe(60)
    expect(countItem(ordered.state.bag, "plank")).toBe(0)
    expect(countItem(ordered.state.bag, "yarn")).toBe(0)
    const collected = apply(
      loadPlayer(JSON.parse(JSON.stringify(ordered.state))),
      { type: "collect", index: 0, expectedOrders: loadPlayer(JSON.parse(JSON.stringify(ordered.state))).orders },
      { now: H },
    )
    if (!collected.ok) throw Error(collected.reason)
    const slot = collected.state.bag.findIndex((entry) => entry?.item === "charm")
    const equipped = apply(collected.state, { type: "equip", slot })
    if (!equipped.ok) throw Error(equipped.reason)
    const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
    expect(saved.equipment.accessory1).toBe("charm")
    expect(saved.worn.accessory1).toEqual({ q: 1, by: "ベネディクト" })
    expect(derive(saved).def - derive(collected.state).def).toBe(1)
  })

  it("three at a time, and not without the materials or the money", () => {
    let p = player({ gold: 1000, bag: bag(["rusty-scrap", 20], ["charcoal", 10]) })
    for (let k = 0; k < MAX_ORDERS; k++) {
      const r = apply(p, { type: "order", commission: "gunter-ingot", roll: 0.5 })
      if (r.ok) p = r.state
    }
    expect(apply(p, { type: "order", commission: "gunter-ingot", roll: 0.5 })).toEqual({ ok: false, reason: "TOO_MANY_ORDERS" })
    expect(apply(player({ gold: 1000 }), { type: "order", commission: "gunter-ingot", roll: 0.5 })).toEqual({ ok: false, reason: "MISSING_INPUTS" })
    expect(apply(player({ gold: 0, bag: bag(["rusty-scrap", 4], ["charcoal", 2]) }), { type: "order", commission: "gunter-ingot", roll: 0.5 })).toEqual({ ok: false, reason: "NO_GOLD" })
  })

  it("retains a finished order when the bag is full, then collects it exactly once", () => {
    const waiting = player({
      bag: emptyBag().map(() => ({ item: "wooden-stick", count: 1 })),
      orders: [{ commission: "rudolf-boots", readyAt: H, q: 2 }],
    })
    const before = structuredClone(waiting)
    expect(apply(waiting, { type: "collect", index: 0, expectedOrders: waiting.orders }, { now: H })).toEqual({ ok: false, reason: "BAG_FULL" })
    expect(waiting).toEqual(before)
    const cleared = { ...waiting, bag: waiting.bag.map((item, index) => (index === 0 ? null : item)) }
    const collected = apply(cleared, { type: "collect", index: 0, expectedOrders: cleared.orders }, { now: H })
    if (!collected.ok) throw Error(collected.reason)
    expect(collected.state.orders).toEqual([])
    expect(countItem(collected.state.bag, "leather-boots")).toBe(1)
    expect(collected.state.friends["ルドルフ"]).toBeGreaterThan(waiting.friends["ルドルフ"] ?? 0)
    expect(apply(collected.state, { type: "collect", index: 0, expectedOrders: collected.state.orders }, { now: H })).toEqual({ ok: false, reason: "NOT_READY" })
  })

  it("does not spend the first material or fee when a later ingredient is missing", () => {
    const state = player({ gold: 100, bag: bag(["iron-ingot", 1]) })
    const before = structuredClone(state)
    expect(apply(state, { type: "order", commission: "gunter-axe", roll: 0.5 }, { now: 0 })).toEqual({ ok: false, reason: "MISSING_INPUTS" })
    expect(state).toEqual(before)
  })

  it("every commission is taken by a real craftsman, and costs less than buying it outright", () => {
    for (const job of COMMISSIONS) {
      expect(
        RESIDENTS.some((r) => r.name === job.craftsman),
        job.id,
      ).toBe(true)
      const outright = ITEMS[job.output.item].price * job.output.count
      expect(job.fee, job.id).toBeLessThan(outright)
    }
  })
})

it("commissions SP medicine without alchemy, saves the waiting order, then consumes one bottle", () => {
  const job = COMMISSIONS.find((job) => job.id === "irmgard-blue-potions")!
  const start = player({ gold: 200, bag: bag(["blue-herb", 3], ["blue-jelly", 1]) })
  const ordered = apply(start, { type: "order", commission: job.id, roll: 0.5 }, { now: 1 })
  if (!ordered.ok) throw Error(ordered.reason)
  expect(ordered.state.life.alchemy).toBe(0)
  expect(ordered.state.gold).toBe(170)
  expect(countItem(ordered.state.bag, "blue-herb")).toBe(0)
  expect(countItem(ordered.state.bag, "blue-jelly")).toBe(0)
  const saved = loadPlayer(JSON.parse(JSON.stringify(ordered.state)))
  const ready = saved.orders[0].readyAt
  expect(apply(saved, { type: "collect", index: 0, expectedOrders: saved.orders }, { now: ready - 1 })).toEqual({ ok: false, reason: "NOT_READY" })
  const collected = apply(saved, { type: "collect", index: 0, expectedOrders: saved.orders }, { now: ready })
  if (!collected.ok) throw Error(collected.reason)
  const slot = collected.state.bag.findIndex((s) => s?.item === "blue-potion")
  expect(collected.state.bag[slot]).toEqual({ item: "blue-potion", count: 2, q: 1, by: job.craftsman })
  const used = apply({ ...collected.state, sp: 0, spAt: ready }, { type: "use", slot }, { now: ready })
  if (!used.ok) throw Error(used.reason)
  expect(used.state.sp).toBe(Math.min(40, derive(used.state).maxSp))
  expect(countItem(used.state.bag, "blue-potion")).toBe(1)
  expect(apply(used.state, { type: "collect", index: 0, expectedOrders: used.state.orders }, { now: ready })).toEqual({ ok: false, reason: "NOT_READY" })
  const cost = job.fee + job.inputs.reduce((sum, input) => sum + ITEMS[input.item].price * input.count, 0)
  expect(cost).toBeLessThan(ITEMS["blue-potion"].price * job.output.count)
})
