import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { artsOf } from "#/world/core/arts-of"
import { loadPlayer } from "#/world/core/load-player"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it("crafts a staff at the current woodwork milestone and uses its spell and prayer", () => {
  const base = player()
  const before = player({
    name: "エルナ",
    gold: 200,
    hp: 1,
    stats: { ...base.stats, mnd: 9, int: 9, fth: 9 },
    life: { ...base.life, carpentry: lifeExpAt(4) },
    bag: bagWith(["plank", 2]),
  })
  const bought = apply(before, { type: "buy", shop: "crystal", item: "small-crystal", count: 1 })
  if (!bought.ok) throw Error(bought.reason)
  const crafted = apply(bought.state, { type: "craft", recipe: "oak-staff", station: "workshop-bench", roll: 0.5 })
  if (!crafted.ok) throw Error(crafted.reason)
  expect(crafted.events[0]).toMatchObject({ type: "crafted", item: "oak-staff" })
  const slot = crafted.state.bag.findIndex((s) => s?.item === "oak-staff")
  const equipped = apply(crafted.state, { type: "equip", slot })
  if (!equipped.ok) throw Error(equipped.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
  expect(saved.worn.weapon).toEqual({ q: 1, by: "エルナ" })
  expect(artsOf(saved.equipment.weapon)).toEqual(expect.arrayContaining(["ember", "mend"]))
  const spell = apply(saved, { type: "art", skill: "ember" })
  if (!spell.ok) throw Error(spell.reason)
  expect(spell.state.sp).toBeLessThan(saved.sp)
  const prayer = apply(spell.state, { type: "cast", skill: "mend" })
  if (!prayer.ok) throw Error(prayer.reason)
  expect(prayer.state.hp).toBeGreaterThan(saved.hp)
  expect(prayer.state.sp).toBeLessThan(spell.state.sp)
  const tea = apply(prayer.state, { type: "buy", shop: "apothecary", item: "herb-tea", count: 1 })
  if (!tea.ok) throw Error(tea.reason)
  const cup = tea.state.bag.findIndex((s) => s?.item === "herb-tea")
  const drank = apply(tea.state, { type: "use", slot: cup })
  if (!drank.ok) throw Error(drank.reason)
  expect(drank.state.sp).toBeGreaterThan(prayer.state.sp)
  expect(drank.state.bag.some((s) => s?.item === "herb-tea")).toBe(false)
  const resumed = loadPlayer(JSON.parse(JSON.stringify(drank.state)))
  expect(resumed.focusUntil).toBeGreaterThan(0)
  const again = apply(resumed, { type: "art", skill: "ember" }, { now: resumed.ready.ember! })
  if (!again.ok) throw Error(again.reason)
  expect(again.state.sp).toBeLessThan(resumed.sp)
})
