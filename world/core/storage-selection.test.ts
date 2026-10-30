import { expect, it } from "vitest"
import { apply } from "./apply"
import { emptyBag } from "#/world/core/empty-bag"
import type { Stack } from "#/world/core/bag-types"
import type { ServerCommand } from "./commands"
import { player } from "#/world/test/player"
const original: Stack = { item: "wood-axe", count: 1, q: 1, by: "ギュンター", dur: 3 }
for (const action of ["store", "retrieve"] as const) {
  const command = (expectedStack: Stack | null): ServerCommand => (action === "store" ? { type: "store", slot: 0, count: 1, expectedStack } : { type: "retrieve", index: 0, count: 1, expectedStack })
  it.each(["item", "count", "q", "by", "dur"] as const)(`${action} rejects a changed %s without moving goods or charging a fee`, (field) => {
    const changed: Stack = { ...original, ...({ item: { item: "fishing-rod" }, count: { count: 2 }, q: { q: 2 }, by: { by: "ゴットフリート" }, dur: { dur: 2 } } as const)[field] }
    const bag = [changed, ...emptyBag(23)]
    const state = player({ gold: 20, ...(action === "store" ? { bag } : { storage: bag }) }),
      before = structuredClone(state)
    expect(apply(state, command(original), { now: 1000 })).toEqual({ ok: false, reason: "ITEM_CHANGED" })
    expect(state).toEqual(before)
  })
  it(`${action} accepts the exact selected worn tool`, () => {
    const bag = [original, ...emptyBag(23)]
    const state = player({ gold: 20, ...(action === "store" ? { bag } : { storage: bag }) })
    const result = apply(state, command({ ...original }), { now: 1000 })
    if (!result.ok) throw Error(result.reason)
    expect(action === "store" ? result.state.storage[0] : result.state.bag.find((s) => s?.item === original.item)).toEqual(original)
  })
  it(`${action} rejects the same partial transfer twice`, () => {
    const stack: Stack = { item: "herb", count: 5 },
      bag = [stack, ...emptyBag(23)]
    const first = apply(player({ gold: 20, ...(action === "store" ? { bag } : { storage: bag }) }), command(stack), { now: 1000 })
    if (!first.ok) throw Error(first.reason)
    const before = structuredClone(first.state)
    expect(apply(first.state, command(stack), { now: 1000 })).toEqual({ ok: false, reason: "ITEM_CHANGED" })
    expect(first.state).toEqual(before)
  })
}
