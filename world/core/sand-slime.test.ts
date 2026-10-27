import { expect, it } from "vitest"
import { MONSTER_KINDS, SPAWNS, dropsOf, monsterAt } from "./monsters"
import { MAPS, walkable } from "../maps"
import { emptyWild, hit, hpOf } from "./wild"
import { apply } from "./apply"
import { countItem } from "./bag"
import { player } from "../test/helpers"

const spawns = SPAWNS.filter((s) => s.kind === "sand-slime")
it("provides a dune opponent between blue and moss slimes", () => {
  expect(spawns.length).toBeGreaterThan(0)
  const sand = MONSTER_KINDS["sand-slime"]
  expect(sand.hp).toBeGreaterThan(MONSTER_KINDS["blue-slime"].hp)
  expect(sand.hp).toBeLessThan(MONSTER_KINDS["moss-slime"].hp)
  expect(sand.atk).toBeGreaterThan(MONSTER_KINDS["blue-slime"].atk)
  expect(sand.atk).toBeLessThan(MONSTER_KINDS["moss-slime"].atk)
})
it.each(spawns)("keeps $id on walkable dune ground throughout the day", (spawn) => {
  expect(spawn.map).toBe("red-dunes")
  const free = (x: number, z: number) => walkable(MAPS[spawn.map], [Math.floor(x * 2), Math.floor(z * 2)])
  for (let time = 0; time < 86400000; time += 7311) {
    const at = monsterAt(spawn, time, free)
    expect(free(at.x, at.z)).toBe(true)
  }
})
it("turns scrap from two dune fights into iron while retaining claim and recovery rules", () => {
  const kind = MONSTER_KINDS["sand-slime"]
  let p = player()
  for (const spawn of spawns.slice(0, 2)) {
    const first = hit(emptyWild(), spawn.id, 1, 0, "hunter")
    expect(hit(first.state, spawn.id, kind.hp, 1, "other").refused).toBe(true)
    const beaten = hit(first.state, spawn.id, kind.hp, 2, "hunter")
    expect(beaten.beaten).toBe(true)
    expect(hpOf(beaten.state, spawn.id, 3)).toBe(0)
    expect(hpOf(beaten.state, spawn.id, 2 + kind.respawn * 1000)).toBe(kind.hp)
    const loot = apply(p, { type: "loot", monster: spawn.id, exp: kind.exp, items: dropsOf(kind, [0, 0]) })
    if (!loot.ok) throw Error(loot.reason)
    p = loot.state
  }
  expect(countItem(p.bag, "rusty-scrap")).toBe(2)
  const bought = apply(p, { type: "buy", shop: "firewood", item: "charcoal", count: 1 })
  if (!bought.ok) throw Error(bought.reason)
  const crafted = apply(bought.state, { type: "craft", recipe: "iron-ingot", station: "craft-forge", roll: 0.5 })
  if (!crafted.ok) throw Error(crafted.reason)
  expect(countItem(crafted.state.bag, "rusty-scrap")).toBe(0)
  expect(countItem(crafted.state.bag, "iron-ingot")).toBe(1)
})
