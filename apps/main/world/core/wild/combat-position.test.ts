import { expect, it } from "vitest"
import { hit } from "#/world/core/wild/hit"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { viewWild } from "#/world/core/wild/view-wild"
import { CLAIM_MS, SPAWNS } from "#/world/core/monsters"
import { getMonsterCombatTime } from "#/world/core/get-monster-combat-time"

const spawn = SPAWNS.find((entry) => entry.kind === "slime")!

it("holds the first strike position across misses, party strikes and save reloads", () => {
  const first = hit({ state: emptyWild(), id: spawn.id, damage: 0, now: 1000, player: "hunter", party: "party" })
  const later = hit({ state: structuredClone(first.state), id: spawn.id, damage: 1, now: 9000, player: "mate", party: "party" })
  const health = viewWild(later.state, spawn.map, 10000)[spawn.id]
  expect(health.combat).toEqual({ at: 1000, until: 9000 + CLAIM_MS })
  expect(getMonsterCombatTime({ combat: health.combat, now: 20000 })).toBe(1000)
  expect(getMonsterCombatTime({ combat: health.combat, now: 9000 + CLAIM_MS })).toBe(9000 + CLAIM_MS)
  expect(viewWild(later.state, spawn.map, 9000 + CLAIM_MS)[spawn.id].combat).toBeUndefined()
  const renewed = hit({ state: later.state, id: spawn.id, damage: 1, now: 9000 + CLAIM_MS, player: "other" })
  expect(viewWild(renewed.state, spawn.map, 9000 + CLAIM_MS)[spawn.id].combat?.at).toBe(9000 + CLAIM_MS)
})

it("does not relocate a fight when a stranger is refused and clears its hold on defeat and respawn", () => {
  const first = hit({ state: emptyWild(), id: spawn.id, damage: 1, now: 1000, player: "hunter" })
  const refused = hit({ state: first.state, id: spawn.id, damage: 1, now: 2000, player: "other" })
  expect(refused.refused).toBe(true)
  expect(refused.state).toBe(first.state)
  const killed = hit({ state: first.state, id: spawn.id, damage: 10000, now: 3000, player: "hunter" })
  expect(viewWild(killed.state, spawn.map, 3000)[spawn.id].combat).toBeUndefined()
  expect(viewWild(killed.state, spawn.map, killed.state.back[spawn.id])[spawn.id].combat).toBeUndefined()
})

it("reads legacy fights and leaves non-retaliating animals on their ordinary route", () => {
  const state = emptyWild()
  state.by[spawn.id] = { player: "hunter", at: 1000 }
  expect(viewWild(state, spawn.map, 2000)[spawn.id].combat).toEqual({ at: 1000, until: 1000 + CLAIM_MS })
  const hare = SPAWNS.find((entry) => entry.kind === "hare")!
  const struck = hit({ state, id: hare.id, damage: 1, now: 2000, player: "hunter" })
  expect(viewWild(struck.state, hare.map, 2000)[hare.id].combat).toBeUndefined()
})
