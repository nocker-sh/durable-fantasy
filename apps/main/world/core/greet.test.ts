import { expect, it } from "vitest"
import { greet } from "#/world/core/greet"
import { FRIEND } from "#/world/core/friendship-rules"
import { player } from "#/world/test/player"
import { PEOPLE } from "#/world/town/people"

const someone = Object.keys(PEOPLE)[0]
const day = Date.parse("2026-11-09T12:00:00Z")

it("befriends a resident a little, once a day", () => {
  const first = greet(player(), someone, day)
  expect(first.ok && first.state.friends[someone]).toBe(FRIEND.bought)
  const again = first.ok ? greet(first.state, someone, day + 60_000) : first
  expect(again.ok && again.state.friends[someone]).toBe(FRIEND.bought)
  const tomorrow = again.ok ? greet(again.state, someone, day + 24 * 3600_000) : again
  expect(tomorrow.ok && tomorrow.state.friends[someone]).toBe(FRIEND.bought * 2)
})

it("knows nobody who is not a resident", () => {
  expect(greet(player(), "nobody at all", day).ok).toBe(false)
})
