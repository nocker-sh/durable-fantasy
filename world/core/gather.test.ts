import { describe, expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import { NODES } from "#/world/core/gather"
import { nodeOf } from "#/world/core/node-of"
import { yieldOf } from "#/world/core/yield-of"
import { GATHER_EXP, LIFE_CAP, LIFE_TOTAL_CAP } from "#/world/core/life-rules"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { lifeLevel } from "#/world/core/life-level"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { emptyNature } from "#/world/core/nature/empty-nature"
import { giveOne } from "#/world/core/nature/give-one"
import { leftAt } from "#/world/core/nature/left-at"
import { takeOne } from "#/world/core/nature/take-one"
import { player } from "#/world/test/player"

const tree = NODES.find((n) => n.kind === "tree")!
const herb = NODES.find((n) => n.kind === "herbs")!
const withAxe = (dur?: number) => {
  const bag = addItem({ bag: emptyBag(), item: "wood-axe", count: 1, mark: { q: 1, by: "ギュンター" } })!
  return dur === undefined ? bag : bag.map((s) => (s ? { ...s, dur } : s))
}

describe("gathering", () => {
  it("a tree needs an axe; herbs need nothing", () => {
    expect(apply(player(), { type: "gather", node: tree.id, roll: 0.1 })).toEqual({ ok: false, reason: "NO_TOOL" })
    expect(apply(player(), { type: "gather", node: herb.id, roll: 0.1 }).ok).toBe(true)
  })

  it("chopping brings wood, wears the axe, tires you and brings experience", () => {
    const r = apply(player({ stamina: 50, bag: withAxe() }), { type: "gather", node: tree.id, roll: 0.05 }, { now: 0 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(countItem(r.state.bag, "log")).toBeGreaterThan(0)
    const axe = r.state.bag.find((s) => s?.item === "wood-axe")!
    expect(axe.dur).toBe(39)
    expect(r.state.stamina).toBe(50 - 2) // 1, half again in the cold (rounded up)
    expect(r.state.life.woodcutting).toBe(GATHER_EXP)
  })

  it("an axe on its last use breaks", () => {
    const r = apply(player({ bag: withAxe(1) }), { type: "gather", node: tree.id, roll: 0.5 })
    expect(r.ok && r.events[0]).toMatchObject({ type: "gathered", broke: "wood-axe" })
    expect(r.ok && r.state.bag.some((s) => s?.item === "wood-axe")).toBe(false)
  })

  it.each([1, 2])("handles a full bag with %i uses left without partial consumption", (dur) => {
    const p = player({ bag: withAxe(dur).map((slot) => slot ?? { item: "dagger", count: 1 }) })
    const original = structuredClone(p)
    const result = apply(p, { type: "gather", node: tree.id, roll: 0.5 })
    expect(p).toEqual(original)
    if (dur > 1) {
      expect(result).toEqual({ ok: false, reason: "BAG_FULL" })
      return
    }
    if (!result.ok) throw Error(result.reason)
    expect(result.state.bag[0]).toEqual({ item: "log", count: 1 })
    expect(result.events[0]).toMatchObject({ type: "gathered", broke: "wood-axe" })
  })

  it("too tired to gather at all", () => {
    expect(apply(player({ stamina: 1 }), { type: "gather", node: herb.id, roll: 0.1 })).toEqual({ ok: false, reason: "EXHAUSTED" })
  })

  it("rarer things turn up only past a milestone, and more come at levels 4 and 8", () => {
    const n = nodeOf("deep-forest-mushrooms-1")!
    const seen = (level: number) => new Set(Array.from({ length: 200 }, (_, i) => yieldOf({ node: n, level: level, power: 1, roll: i / 200 }).item))
    expect(seen(3).has("blue-herb")).toBe(false)
    expect(seen(4).has("blue-herb")).toBe(true)
    expect([0, 2, 4, 8].map((lv) => yieldOf({ node: herb, level: lv, power: 1, roll: 0.5 }).count)).toEqual([1, 1, 2, 3])
  })

  it("a life skill stops at its cap, and all of them together stop at the ceiling", () => {
    const at8 = lifeExpAt(LIFE_CAP)
    const top = apply(player({ life: { ...player().life, foraging: at8 } }), { type: "gather", node: herb.id, roll: 0.01 })
    expect(top.ok && top.state.life.foraging).toBe(at8)
    // three at 8 make 24: the fourth gains up to the end of level 0 and no further
    const full = player({ bag: withAxe(), life: { ...player().life, foraging: at8, cooking: at8, alchemy: at8 } })
    let p = full
    for (let k = 0; k < 20; k++) {
      const r = apply({ ...p, stamina: 100 }, { type: "gather", node: tree.id, roll: 0.5 })
      if (r.ok) p = r.state
    }
    expect(lifeLevel(p.life.woodcutting)).toBe(0)
    expect(p.life.woodcutting).toBe(lifeExpAt(1) - 1)
    expect(LIFE_TOTAL_CAP).toBe(24)
  })

  it("a woodcutter's axe held as a weapon chops too, and wears where it is held", () => {
    const axe = { item: "wood-axe" as const, q: 1 as const, by: "ギュンター", dur: 1 }
    const p = player({ equipment: { ...emptyEquipment(), weapon: "wood-axe" }, worn: { weapon: { q: axe.q, by: axe.by, dur: axe.dur } } })
    const r = apply(p, { type: "gather", node: tree.id, roll: 0.5 })
    expect(r.ok && r.events[0]).toMatchObject({ type: "gathered", broke: "wood-axe" })
    expect(r.ok && r.state.equipment.weapon).toBeNull()
  })
})

describe("the spots in town are shared and come back", () => {
  it("runs out after so many goes and comes back one at a time", () => {
    let s = emptyNature()
    for (let k = 0; k < tree.max; k++) s = takeOne(s, tree.id, 0)!
    expect(takeOne(s, tree.id, 0)).toBeNull()
    expect(leftAt(s, tree.id, tree.regen * 60_000)).toBe(1)
    expect(leftAt(s, tree.id, 100 * tree.regen * 60_000)).toBe(tree.max)
    expect(leftAt(giveOne(s, tree.id, 0), tree.id, 0)).toBe(1)
  })
})
