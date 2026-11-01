import { expect, it } from "vitest"
import { COUNTER_INTERVAL, COUNTER_MAX, MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { hit } from "#/world/core/wild/hit"

const slime = SPAWNS.find((s) => s.kind === "slime")!
const hare = SPAWNS.find((s) => s.kind === "hare")!
const interval = MONSTER_KINDS.slime.interval ?? COUNTER_INTERVAL

it("lets the holder's party mates strike the same creature, but not strangers or another party", () => {
  const first = hit({ state: emptyWild(), id: slime.id, damage: 5, now: 0, player: "a", party: "p" })
  const mate = hit({ state: first.state, id: slime.id, damage: 5, now: 100, player: "b", party: "p" })
  expect(mate.refused).toBe(false)
  expect(mate.hp).toBe(MONSTER_KINDS.slime.hp - 10)
  expect(hit({ state: mate.state, id: slime.id, damage: 5, now: 200, player: "c" })).toMatchObject({ refused: true, reason: "TAKEN" })
  expect(hit({ state: mate.state, id: slime.id, damage: 5, now: 200, player: "c", party: "q" })).toMatchObject({ refused: true, reason: "TAKEN" })
  // the one who opened the fight may still strike after a mate's blow
  expect(hit({ state: mate.state, id: slime.id, damage: 5, now: 300, player: "a", party: "p" }).refused).toBe(false)
})

it("does not let a lone holder's fight be joined by someone naming no party", () => {
  const first = hit({ state: emptyWild(), id: slime.id, damage: 5, now: 0, player: "a" })
  expect(hit({ state: first.state, id: slime.id, damage: 5, now: 100, player: "b" }).refused).toBe(true)
})

it("times the creature's blows from the start of the fight, not from each strike", () => {
  const first = hit({ state: emptyWild(), id: slime.id, damage: 0, now: 0, player: "a" })
  // struck, it answers at once
  expect(first.counters).toBe(1)
  // quick swings in between are not each answered
  const quick = hit({ state: first.state, id: slime.id, damage: 0, now: interval / 2, player: "a" })
  expect(quick.counters).toBe(0)
  const due = hit({ state: quick.state, id: slime.id, damage: 0, now: interval, player: "a" })
  expect(due.counters).toBe(1)
  // a pause does not make it safe: the blows that fell due land with the next strike, up to a few
  const paused = hit({ state: due.state, id: slime.id, damage: 0, now: interval * 3, player: "a" })
  expect(paused.counters).toBe(2)
  const long = hit({ state: paused.state, id: slime.id, damage: 0, now: interval * 3 + 20_000, player: "a" })
  expect(long.counters).toBe(COUNTER_MAX)
})

it("keeps the blow schedule when a party mate takes a turn and stops it once the creature is beaten", () => {
  const first = hit({ state: emptyWild(), id: slime.id, damage: 0, now: 0, player: "a", party: "p" })
  expect(hit({ state: first.state, id: slime.id, damage: 0, now: 10, player: "b", party: "p" }).counters).toBe(0)
  expect(hit({ state: first.state, id: slime.id, damage: 999, now: interval * 2, player: "a", party: "p" })).toMatchObject({ beaten: true, counters: 0 })
})

it("gives no blows to a creature that only runs", () => {
  expect(hit({ state: emptyWild(), id: hare.id, damage: 0, now: 0, player: "a" }).counters).toBe(0)
})
