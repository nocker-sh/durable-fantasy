import { expect, it } from "vitest"
import { hasCompanionHere } from "#/world/server/map-room/has-companion-here"
import { threadOf } from "#/world/core/thread-of"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { newPlayer } from "#/world/core/new-player"
import type { Presence } from "#/world/server/map-room/presence"

const here = (owner: string, party: string | null = null): { state: Presence } => ({
  state: { owner, party, player: mapPlayer(owner, newPlayer(), [0, 0]), route: [[0, 0]], since: 0, said: [], engaged: null },
})

it("lets in over the cap only beside a party mate or a friend who is really in the channel", () => {
  const stranger = here("stranger")
  expect(hasCompanionHere({ owner: "me", player: { party: null, threads: [] }, connections: [stranger] })).toBe(false)
  expect(hasCompanionHere({ owner: "me", player: { party: "p", threads: [] }, connections: [stranger, here("mate", "p")] })).toBe(true)
  expect(hasCompanionHere({ owner: "me", player: { party: "p", threads: [] }, connections: [here("other", "q")] })).toBe(false)
  expect(hasCompanionHere({ owner: "me", player: { party: null, threads: [threadOf("friend", "友", 1)] }, connections: [here("friend")] })).toBe(true)
})

it("does not count the joining player's own older connection", () => {
  expect(hasCompanionHere({ owner: "me", player: { party: "p", threads: [] }, connections: [here("me", "p")] })).toBe(false)
})
