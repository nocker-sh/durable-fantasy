import { expect, it } from "vitest"
import { apply } from "./apply"
import { dropsOf, MONSTER_KINDS, SPAWNS } from "./monsters"
import { lifeExpAt } from "./life"
import { bagWith, player } from "../test/helpers"

it("turns loot from a spawned forest animal into a wearable charm", () => {
  const spawn = SPAWNS.find((s) => s.kind === "ash-hare")!
  expect(spawn.map).toBe("forest-edge")
  const kind = MONSTER_KINDS[spawn.kind]
  expect(dropsOf(kind, [0.64, 0.99])).toEqual(["sharp-fang"])
  expect(dropsOf(kind, [0.65, 0.35])).toEqual([])
  let state = player({ name: "エルナ", gold: 100, bag: bagWith(["yarn", 1]), life: { ...player().life, tailoring: lifeExpAt(4) } })
  for (let i = 0; i < 3; i++) {
    const loot = apply(state, { type: "loot", monster: spawn.id, exp: kind.exp, items: dropsOf(kind, [0, 1]) })
    if (!loot.ok) throw Error(loot.reason)
    state = loot.state
  }
  const crafted = apply(state, { type: "craft", recipe: "fang-charm", station: "workshop-loom", roll: 0.5 })
  if (!crafted.ok) throw Error(crafted.reason)
  const slot = crafted.state.bag.findIndex((s) => s?.item === "fang-charm")
  expect(crafted.state.bag[slot]).toMatchObject({ by: "エルナ", count: 1 })
  const worn = apply(crafted.state, { type: "equip", slot })
  if (!worn.ok) throw Error(worn.reason)
  expect(worn.state.equipment.accessory1).toBe("fang-charm")
})
