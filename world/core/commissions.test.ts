import { describe, expect, it } from "vitest"
import { apply } from "./apply.ts"
import { addItem, countItem, emptyBag, type Bag } from "./bag.ts"
import { COMMISSIONS, MAX_ORDERS } from "./commissions.ts"
import { ITEMS, type ItemId } from "./items.ts"
import { RESIDENTS } from "../town/residents.ts"
import { derive } from "./stats.ts"
import { loadPlayer } from "./player.ts"
import { player } from "../test/helpers.ts"

const bag = (...items: [ItemId, number][]): Bag => items.reduce<Bag>((b, [id, n]) => addItem(b, id, n)!, emptyBag())
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
    expect(apply(state, { type: "collect", index: 0 }, { now: H })).toEqual({ ok: false, reason: "NOT_READY" })
    for (let i = 0; i < 2; i++) {
      const collect = apply(state, { type: "collect", index: 0 }, { now: 2 * H })
      expect(collect.ok).toBe(true)
      if (!collect.ok) return
      state = collect.state
    }
    expect(countItem(state.bag, "tanned-leather")).toBe(4)
    const armor = apply(state, { type: "order", commission: "rudolf-armor", roll: 0.5 }, { now: 2 * H })
    expect(armor.ok).toBe(true)
    if (!armor.ok) return
    expect(countItem(armor.state.bag, "tanned-leather")).toBe(0)
    const ready = apply(armor.state, { type: "collect", index: 0 }, { now: 5 * H })
    expect(ready.ok && countItem(ready.state.bag, "leather-armor")).toBe(1)
    expect(armor.state.gold).toBe(326)
    expect(500 - armor.state.gold).toBeLessThan(ITEMS["leather-armor"].price)
    expect(apply(player({ gold: 500, bag: bag(["soft-fur", 4]) }), { type: "order", commission: "rudolf-armor", roll: 0.5 })).toEqual({ ok: false, reason: "MISSING_INPUTS" })
  })

  it("still delivers armor ordered before the material change", () => {
    const waiting = player({ orders: [{ commission: "rudolf-armor", readyAt: H, q: 1 }] })
    const result = apply(waiting, { type: "collect", index: 0 }, { now: H })
    expect(result.ok && countItem(result.state.bag, "leather-armor")).toBe(1)
  })

  it("takes the iron and the fee now, and the sword is ready in two hours", () => {
    const p = player({ gold: 200, bag: bag(["iron-ingot", 3]) })
    const r = apply(p, { type: "order", commission: "gunter-sword", roll: 0.5 }, { now: 0 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(countItem(r.state.bag, "iron-ingot")).toBe(0)
    expect(r.state.gold).toBe(80)
    expect(apply(r.state, { type: "collect", index: 0 }, { now: H })).toEqual({ ok: false, reason: "NOT_READY" })
    const got = apply(r.state, { type: "collect", index: 0 }, { now: 2 * H })
    expect(got.ok && countItem(got.state.bag, "iron-sword")).toBe(1)
    expect(got.ok && got.state.orders).toHaveLength(0)
  })

  it("a made thing comes with the craftsman's name and their quality", () => {
    const p = player({ gold: 200, bag: bag(["herb", 10], ["jelly", 2]) })
    const r = apply(p, { type: "order", commission: "irmgard-potions", roll: 0.5 }, { now: 0 })
    const got = r.ok ? apply(r.state, { type: "collect", index: 0 }, { now: H }) : r
    expect(got.ok && got.state.bag.find((s) => s?.item === "potion")).toMatchObject({ by: "イルムガルト", count: 5 })
  })

  it.each(["rudolf-armor", "beatrix-mail"])("retains commissioned armor quality through saving, equipment and removal: %s", (id) => {
    const job = COMMISSIONS.find((job) => job.id === id)!
    const base = player()
    const p = player({ gold: 1000, stats: { ...base.stats, str: 12, vit: 12 }, bag: bag(...job.inputs.map((input) => [input.item, input.count] as [ItemId, number])) })
    const ordered = apply(p, { type: "order", commission: id, roll: 0.8 }, { now: 0 })
    if (!ordered.ok) throw Error(ordered.reason)
    expect(ordered.state.orders[0].q).toBe(2)
    const collected = apply(loadPlayer(JSON.parse(JSON.stringify(ordered.state))), { type: "collect", index: 0 }, { now: job.minutes * 60_000 })
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
