import { expect, it } from "vitest"
import { isWalking } from "#/world/server/map-room/is-walking"
import type { Cell } from "#/world/protocol"

const route: Cell[] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
]

it("counts a player as walking until the end of the saved route is certainly reached", () => {
  expect(isWalking({ route: [[4, 4]], since: 0 }, 0)).toBe(false)
  expect(isWalking({ route, since: 0 }, 100)).toBe(true)
  expect(isWalking({ route, since: 0 }, 10_000)).toBe(false)
})
