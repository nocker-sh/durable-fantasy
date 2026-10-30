import { expect, it } from "vitest"
import { apply } from "./apply"
import { derive } from "#/world/core/derive"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { countItem } from "#/world/core/count-item"
import { loadPlayer } from "#/world/core/load-player"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it("crafts and saves a necklace that strengthens a learned prayer through its faith bonus", () => {
  const base = player()
  const before = player({
    name: "エルナ",
    gold: 500,
    hp: 1,
    sp: 20,
    stats: { ...base.stats, fth: 9, mnd: 7 },
    equipment: { ...base.equipment, weapon: "oak-staff" },
    life: { ...base.life, carpentry: lifeExpAt(8) },
    bag: bagWith(["plank", 2], ["yarn", 1]),
  })
  const bought = apply(before, { type: "buy", shop: "crystal", item: "small-crystal", count: 2 })
  if (!bought.ok) throw Error(bought.reason)
  const command = { type: "craft" as const, recipe: "prayer-necklace", station: "workshop-bench", roll: 0.5 }
  expect(apply({ ...bought.state, life: { ...base.life, carpentry: lifeExpAt(7) } }, command)).toEqual({ ok: false, reason: "NOT_SKILLED" })
  const made = apply(bought.state, command)
  if (!made.ok) throw Error(made.reason)
  for (const item of ["plank", "yarn", "small-crystal"] as const) expect(countItem(made.state.bag, item)).toBe(0)
  const slot = made.state.bag.findIndex((s) => s?.item === "prayer-necklace")
  expect(made.state.bag[slot]).toMatchObject({ q: 1, by: "エルナ" })
  const equipped = apply(made.state, { type: "equip", slot })
  if (!equipped.ok) throw Error(equipped.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
  expect(saved.worn.accessory1).toEqual({ q: 1, by: "エルナ" })
  expect(derive(saved).stats.fth).toBe(11)
  expect(derive(saved).maxSp).toBe(derive(made.state).maxSp + 20)
  expect(apply({ ...saved, stats: { ...saved.stats, fth: 7 } }, { type: "cast", skill: "mend" })).toEqual({ ok: false, reason: "STAT_TOO_LOW" })
  const unaided = apply(made.state, { type: "cast", skill: "mend" })
  if (!unaided.ok) throw Error(unaided.reason)
  const prayer = apply(saved, { type: "cast", skill: "mend" })
  if (!prayer.ok) throw Error(prayer.reason)
  expect(prayer.state.hp).toBeGreaterThan(unaided.state.hp)
})
