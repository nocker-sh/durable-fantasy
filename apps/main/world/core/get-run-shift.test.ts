import { expect, it } from "vitest"
import { getRunShift } from "#/world/core/get-run-shift"
import { FLEE_MS, FLEE_RATE } from "#/world/core/monster-motion-rules"
import { getMonsterCombatTime } from "#/world/core/get-monster-combat-time"
import { hit } from "#/world/core/wild/hit"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { SPAWNS } from "#/world/core/monsters"

it("runs a fleeing creature ahead after a blow, then keeps what it gained", () => {
  const run = { base: 0, start: 1000 }
  expect(getRunShift(run, 1000)).toBe(0)
  expect(getRunShift(run, 1000 + FLEE_MS / 2)).toBe(((FLEE_RATE - 1) * FLEE_MS) / 2)
  expect(getRunShift(run, 1000 + FLEE_MS * 10)).toBe((FLEE_RATE - 1) * FLEE_MS)
})

it("never sends a hare's clock backwards across blows, so it never jumps", () => {
  const hare = SPAWNS.find((spawn) => spawn.kind === "hare")!
  let state = emptyWild()
  const times: number[] = []
  for (const now of [1000, 2500, 7000]) {
    const struck = hit({ state, id: hare.id, damage: 1, now, player: "hunter" })
    expect(struck.refused).toBe(false)
    state = struck.state
  }
  for (let now = 1000; now < 20_000; now += 250) times.push(getMonsterCombatTime({ combat: undefined, run: state.run?.[hare.id], now }))
  for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThanOrEqual(times[i - 1])
  expect(times.at(-1)! - 19_750).toBeGreaterThan(0)
})

it("leaves a creature that strikes back to stand and fight, and forgets a beaten hare's run", () => {
  const slime = SPAWNS.find((spawn) => spawn.kind === "slime")!
  expect(hit({ state: emptyWild(), id: slime.id, damage: 1, now: 1000, player: "hunter" }).state.run?.[slime.id]).toBeUndefined()
  const hare = SPAWNS.find((spawn) => spawn.kind === "hare")!
  const ran = hit({ state: emptyWild(), id: hare.id, damage: 1, now: 1000, player: "hunter" }).state
  expect(ran.run?.[hare.id]).toBeDefined()
  expect(hit({ state: ran, id: hare.id, damage: 999, now: 2000, player: "hunter" }).state.run?.[hare.id]).toBeUndefined()
})
