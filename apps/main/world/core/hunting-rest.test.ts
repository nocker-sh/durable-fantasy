import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { derive } from "#/world/core/derive"
import { settle } from "#/world/core/settle"
import { newPlayer } from "#/world/core/new-player"
import { bagWith } from "#/world/test/bag-with"
import { FIGHT_STAMINA } from "#/world/core/monsters"
import { countItem } from "#/world/core/count-item"

it.each([1, 16, 32])("makes a seated break catch up with HP and SP at level %s", (level) => {
  const state = { ...newPlayer(), level, stats: { vit: 24, str: 20, dex: 15, int: 24, mnd: 20, fth: 5 }, hp: 1, sp: 0, hpAt: 1000, spAt: 1000, sitting: true }
  const stats = derive(state)
  expect(settle(state, stats, 20999).sp).toBe(0)
  const rested = settle(state, stats, 21000)
  expect(rested.hp).toBe(stats.maxHp)
  expect(rested.sp).toBe(stats.maxSp)
  expect(settle({ ...state, sitting: false }, stats, 21000).hp).toBeLessThan(stats.maxHp / 2)
  expect(settle({ ...state, hp: 0 }, stats, 21000).hp).toBe(0)
})

it("does not turn standing time into seated recovery by sitting just before a tick", () => {
  const state = { ...newPlayer(), hp: 1, sp: 0, hpAt: 1000, spAt: 1000 }
  const sat = apply(state, { type: "sit" }, { now: 20999 })
  if (!sat.ok) throw Error(sat.reason)
  expect(settle(sat.state, derive(state), 21000).hp).toBe(1)
  const repeated = apply(sat.state, { type: "sit" }, { now: 30000 })
  if (!repeated.ok) throw Error(repeated.reason)
  expect(repeated.state.hpAt).toBe(20999)
})

it("supports a half-hour hunt with carried bread without fullness trapping stamina", () => {
  const run = { state: { ...newPlayer(), bag: bagWith(["rye-bread", 12]) } }
  for (let kill = 0; kill < 120; kill++) {
    const now = 1000 + kill * 15000
    if (run.state.stamina < 10) {
      const eaten = apply(run.state, { type: "use-item", item: "rye-bread" }, { now })
      if (!eaten.ok) throw Error(eaten.reason)
      run.state = eaten.state
    }
    expect(run.state.stamina).toBeGreaterThanOrEqual(FIGHT_STAMINA)
    const loot = apply(run.state, { type: "loot", monster: "hunt", exp: 0, items: [] }, { now })
    if (!loot.ok) throw Error(loot.reason)
    run.state = loot.state
  }
  expect(countItem(run.state.bag, "rye-bread")).toBeLessThan(12)
  expect(run.state.full).toBeLessThanOrEqual(100)
})
