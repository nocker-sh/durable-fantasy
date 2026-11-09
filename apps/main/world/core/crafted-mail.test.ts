import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { loadPlayer } from "#/world/core/load-player"
import { derive } from "#/world/core/derive"

it("crafts chain mail from iron and leather, enforcing both craft and wearing requirements", () => {
  const base = player()
  const before = player({ name: "エルナ", gold: 100, bag: bagWith(["iron-ingot", 6], ["tanned-leather", 1]), life: { ...base.life, smithing: lifeExpAt(8) } })
  const command = { type: "craft" as const, recipe: "chain-mail", station: "craft-forge", roll: 0.5 }
  expect(apply({ ...before, life: base.life }, command)).toEqual({ ok: false, reason: "NOT_SKILLED" })
  const made = apply(before, command)
  if (!made.ok) throw Error(made.reason)
  const slot = made.state.bag.findIndex((s) => s?.item === "chain-mail")
  expect(made.state.bag.filter(Boolean)).toEqual([{ item: "chain-mail", count: 1, q: 1, by: "エルナ" }])
  expect(apply(made.state, { type: "equip", slot }).ok).toBe(false)
  const strong = { ...made.state, stats: { ...made.state.stats, str: 10, vit: 8 } }
  const worn = apply(strong, { type: "equip", slot })
  if (!worn.ok) throw Error(worn.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(worn.state)))
  expect(saved.equipment.body).toBe("chain-mail")
  expect(saved.worn.body).toEqual({ q: 1, by: "エルナ" })
  expect(derive(saved).def).toBe(derive(strong).def + 10)
})
