import { expect, it } from "vitest"
import { apply } from "./apply"
import { countItem } from "./bag"
import type { Command, ServerCommand } from "./commands"
import { ITEMS } from "./items"
import { loadPlayer, newPlayer } from "./player"

// Exercise real starting resources and skill levels, without seeding inventory or experience.
// This core journey does not exercise movement, shop hours or shared node reservations.
function journey() {
  let state = newPlayer("エルナ")
  return {
    get state() {
      return state
    },
    run(command: Command | ServerCommand) {
      const result = apply(state, command)
      if (!result.ok) throw Error(`${command.type}: ${result.reason}`)
      state = result.state
      expect(state.gold).toBeGreaterThanOrEqual(0)
      expect(state.stamina).toBeGreaterThanOrEqual(0)
      return result.events
    },
    slot(item: keyof typeof ITEMS) {
      const slot = state.bag.findIndex((s) => s?.item === item)
      expect(slot, item).toBeGreaterThanOrEqual(0)
      return slot
    },
    resume() {
      const saved = JSON.parse(JSON.stringify(state))
      state = loadPlayer(saved)
      return state
    },
  }
}

it("starts gathering bare-handed, cooks tea, recovers and sells the spare serving", () => {
  const play = journey()
  const initial = play.state
  for (let i = 0; i < 2; i++) play.run({ type: "gather", node: "south-meadow-herbs-1", roll: 0.5 })
  expect(countItem(play.state.bag, "herb")).toBe(2)
  play.run({ type: "buy", shop: "firewood", item: "firewood", count: 1 })
  expect(play.run({ type: "craft", recipe: "herb-tea", station: "workshop-hearth", roll: 0.5 })[0]).toMatchObject({ type: "crafted", count: 2 })
  expect(countItem(play.state.bag, "herb")).toBe(0)
  const stamina = play.state.stamina
  play.run({ type: "use", slot: play.slot("herb-tea") })
  expect(play.state.stamina).toBeGreaterThan(stamina)
  expect(play.state.warmUntil).toBeGreaterThan(0)
  const gold = play.state.gold
  play.run({ type: "sell", shop: "apothecary", slot: play.slot("herb-tea"), count: 1 })
  expect(play.state.gold).toBeGreaterThan(gold)
  expect(play.state.life.foraging).toBeGreaterThan(initial.life.foraging)
  expect(play.state.life.cooking).toBeGreaterThan(initial.life.cooking)
  const before = play.state
  const resumed = play.resume()
  expect(resumed.bag).toEqual(before.bag)
  expect(resumed.life).toEqual(before.life)
  expect(resumed.gold).toBe(before.gold)
})

it("affords an axe, survives a spoiled plank and makes equipment from the next log", () => {
  const play = journey()
  expect(apply(play.state, { type: "gather", node: "forest-edge-tree-1", roll: 0.5 })).toEqual({ ok: false, reason: "NO_TOOL" })
  play.run({ type: "buy", shop: "smithy", item: "wood-axe", count: 1 })
  const durability = play.state.bag[play.slot("wood-axe")]!.dur!
  for (let i = 0; i < 2; i++) play.run({ type: "gather", node: "forest-edge-tree-1", roll: 0.5 })
  expect(play.state.bag[play.slot("wood-axe")]!.dur).toBe(durability - 2)
  expect(play.run({ type: "craft", recipe: "plank", station: "workshop-bench", roll: 0 })[0]).toMatchObject({ type: "spoiled" })
  expect(countItem(play.state.bag, "log")).toBe(1)
  expect(play.run({ type: "craft", recipe: "plank", station: "workshop-bench", roll: 0.5 })[0]).toMatchObject({ type: "crafted" })
  play.run({ type: "craft", recipe: "wooden-stick", station: "workshop-bench", roll: 0.5 })
  play.run({ type: "equip", slot: play.slot("wooden-stick") })
  expect(play.state.worn.weapon).toMatchObject({ by: "エルナ", q: 1 })
  expect(play.state.gold).toBeGreaterThan(0)
  expect(play.state.life.carpentry).toBeGreaterThan(0)
  const before = play.state
  const resumed = play.resume()
  expect(resumed.equipment).toEqual(before.equipment)
  expect(resumed.worn).toEqual(before.worn)
  expect(resumed.bag).toEqual(before.bag)
})
