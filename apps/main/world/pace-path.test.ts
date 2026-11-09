import { expect, it } from "vitest"
import { pacePath } from "#/world/pace-path"
import { CELLS_PER_SECOND, MOVE_LEAD_MS } from "#/world/protocol"

const step = 1000 / CELLS_PER_SECOND

it("moves the clock on by the cells between the starts at walking speed", () => {
  expect(pacePath({ from: [10, 10], paced: 5000, to: [10, 10], now: 5000 })).toBe(5000)
  expect(pacePath({ from: [10, 10], paced: 5000, to: [13, 11], now: 5000 })).toBeCloseTo(5000 + 3 * step)
})

it("does not let the clock fall behind receipt, so standing still saves nothing up", () => {
  expect(pacePath({ from: [10, 10], paced: 1000, to: [11, 10], now: 60_000 })).toBe(60_000)
})

it("refuses a start further ahead of walking speed than the lead allows", () => {
  const lead = Math.floor((MOVE_LEAD_MS / 1000) * CELLS_PER_SECOND)
  expect(pacePath({ from: [0, 0], paced: 5000, to: [lead, 0], now: 5000 })).not.toBeNull()
  expect(pacePath({ from: [0, 0], paced: 5000, to: [lead + 1, 0], now: 5000 })).toBeNull()
  // the lead already used still counts when the next path comes at once
  expect(pacePath({ from: [0, 0], paced: 5000 + MOVE_LEAD_MS, to: [1, 0], now: 5000 })).toBeNull()
})
