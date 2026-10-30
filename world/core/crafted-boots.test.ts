import { expect, it } from "vitest"
import { apply } from "./apply"
import { countItem } from "#/world/core/count-item"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { loadPlayer } from "#/world/core/load-player"
import { derive } from "#/world/core/derive"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it.each([
  { item: "leather-boots", part: "feet", leather: 2, yarn: 1, level: 2, defense: 1 },
  { item: "leather-armor", part: "body", leather: 5, yarn: 2, level: 8, defense: 6 },
] as const)("crafts $item and retains maker and quality through equipping and saving", ({ item, part, leather, yarn, level, defense }) => {
  const base = player()
  const before = player({ name: "エルナ", gold: 100, bag: bagWith(["tanned-leather", leather], ["yarn", yarn]), life: { ...base.life, tailoring: lifeExpAt(level) } })
  const command = { type: "craft" as const, recipe: item, station: "workshop-loom", roll: 0.5 }
  expect(apply({ ...before, life: base.life }, command)).toEqual({ ok: false, reason: "NOT_SKILLED" })
  const made = apply(before, command)
  if (!made.ok) throw Error(made.reason)
  expect(countItem(made.state.bag, "tanned-leather")).toBe(0)
  expect(countItem(made.state.bag, "yarn")).toBe(0)
  const slot = made.state.bag.findIndex((s) => s?.item === item)
  expect(made.state.bag[slot]).toEqual({ item, count: 1, q: 1, by: "エルナ" })
  const equipped = apply(made.state, { type: "equip", slot })
  if (!equipped.ok) throw Error(equipped.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
  expect(saved.equipment[part]).toBe(item)
  expect(saved.worn[part]).toEqual({ q: 1, by: "エルナ" })
  expect(derive(saved).def).toBe(derive(before).def + defense)
  const removed = apply(saved, { type: "unequip", slot: part })
  if (!removed.ok) throw Error(removed.reason)
  expect(removed.state.bag).toContainEqual({ item, count: 1, q: 1, by: "エルナ" })
})
