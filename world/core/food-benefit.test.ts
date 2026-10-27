import { expect, it } from "vitest"
import { apply } from "./apply"
import { derive } from "./stats"
import { effectOf } from "./makers"
import { player, bagWith } from "../test/helpers"

const now = 1_000_000
function rested() {
  const base = player()
  const stats = derive(base)
  return player({ hp: stats.maxHp, sp: stats.maxSp, hpAt: now, spAt: now, stamina: 100, full: 0, fullAt: now })
}

it.each(["hot-water", "herb-tea"] as const)("keeps %s when it cannot heal or extend an active effect", (item) => {
  const state = { ...rested(), bag: bagWith([item, 2]), warmUntil: now + 3_600_000, focusUntil: now + 3_600_000 }
  const before = structuredClone(state)
  expect(apply(state, { type: "use", slot: 0 }, { now })).toEqual({ ok: false, reason: "NOTHING_TO_GAIN" })
  expect(state).toEqual(before)
})

it("allows tea to extend focus even while warmth and all resources are full", () => {
  const state = { ...rested(), bag: bagWith(["herb-tea", 2]), warmUntil: now + 3_600_000, focusAt: now - 60_000, focusUntil: now + 1 }
  const result = apply(state, { type: "use", slot: 0 }, { now })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.bag[0]?.count).toBe(1)
  expect(result.state.warmUntil).toBe(state.warmUntil)
  expect(result.state.focusUntil).toBe(now + effectOf("herb-tea", 1).focus * 60_000)
  expect(result.state.focusAt).toBe(state.focusAt)
})

it("allows recovery without shortening longer active effects", () => {
  const state = { ...rested(), sp: 0, bag: bagWith(["herb-tea", 2]), warmUntil: now + 3_600_000, focusUntil: now + 3_600_000 }
  const result = apply(state, { type: "use", slot: 0 }, { now })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.sp).toBeGreaterThan(0)
  expect(result.state.bag[0]?.count).toBe(1)
  expect(result.state.warmUntil).toBe(state.warmUntil)
  expect(result.state.focusUntil).toBe(state.focusUntil)
})
