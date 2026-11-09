import { expect, it } from "vitest"
import { CELLS_PER_SECOND } from "#/world/protocol"
import { paceTo } from "#/world/server/map-room/pace-to"

it("counts the walk from the route's start to the new start", () => {
  const me = { route: [[0, 0] as [number, number]], since: 1000, paced: 1000 }
  expect(paceTo(me, [CELLS_PER_SECOND * 2, 0], 1000)).toBe(3000)
})

it("never falls behind now, so standing still is not saved up", () => {
  expect(paceTo({ route: [[0, 0]], since: 0 }, [0, 0], 5000)).toBe(5000)
})
