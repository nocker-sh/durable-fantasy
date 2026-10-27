import { expect, it } from "vitest"
import { apply } from "./apply"
import { artsOf } from "./skills"
import { loadPlayer } from "./player"
import { lifeExpAt } from "./life"
import { bagWith, player } from "../test/helpers"

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
})
