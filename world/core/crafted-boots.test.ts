import { expect, it } from "vitest"
import { apply } from "./apply"
import { countItem } from "./bag"
import { lifeExpAt } from "./life"
import { loadPlayer } from "./player"
import { derive } from "./stats"
import { bagWith, player } from "../test/helpers"

it("sews boots from leather and yarn, retaining maker and quality through equipping and saving", () => {
  const base = player()
  const before = player({ name: "エルナ", gold: 100, bag: bagWith(["tanned-leather", 2], ["yarn", 1]), life: { ...base.life, tailoring: lifeExpAt(2) } })
  const command = { type: "craft" as const, recipe: "leather-boots", station: "workshop-loom", roll: 0.5 }
  expect(apply({ ...before, life: base.life }, command)).toEqual({ ok: false, reason: "NOT_SKILLED" })
  const made = apply(before, command)
  if (!made.ok) throw Error(made.reason)
  expect(countItem(made.state.bag, "tanned-leather")).toBe(0)
  expect(countItem(made.state.bag, "yarn")).toBe(0)
  const slot = made.state.bag.findIndex((s) => s?.item === "leather-boots")
  expect(made.state.bag[slot]).toEqual({ item: "leather-boots", count: 1, q: 1, by: "エルナ" })
  const equipped = apply(made.state, { type: "equip", slot })
  if (!equipped.ok) throw Error(equipped.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
  expect(saved.equipment.feet).toBe("leather-boots")
  expect(saved.worn.feet).toEqual({ q: 1, by: "エルナ" })
  expect(derive(saved).def).toBe(derive(before).def + 1)
  const removed = apply(saved, { type: "unequip", slot: "feet" })
  if (!removed.ok) throw Error(removed.reason)
  expect(removed.state.bag).toContainEqual({ item: "leather-boots", count: 1, q: 1, by: "エルナ" })
})
