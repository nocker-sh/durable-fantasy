import { expect, it } from "vitest"
import { advancePathWaypoint } from "#/lib/engine/advance-path-waypoint"
import type { PathAdvance, PathFollowerState } from "#/lib/engine/path-follower-types"

it("consumes a coincident waypoint before checking an exhausted budget", () => {
  const state: PathFollowerState = { pos: [0, 0], path: [[0, 0]] }
  const progress: PathAdvance = { remaining: 0, consumed: 0, heading: 1 }
  expect(advancePathWaypoint({ position: state.pos, point: [0, 0], progress })).toBe(true)
  expect(progress).toEqual({ remaining: 0, consumed: 1, heading: 1 })
  expect(advancePathWaypoint({ position: state.pos, point: [1, 0], progress })).toBe(false)
  expect(state.pos).toEqual([0, 0])
  expect(progress.heading).toBe(1)
})

it("retains a partially traversed segment and updates heading", () => {
  const state: PathFollowerState = { pos: [0, 0], path: [[3, 4]] }
  const progress: PathAdvance = { remaining: 2, consumed: 0, heading: null }
  expect(advancePathWaypoint({ position: state.pos, point: [3, 4], progress })).toBe(false)
  expect(state.pos).toEqual([1.2, 1.6])
  expect(state.path).toEqual([[3, 4]])
  expect(progress.consumed).toBe(0)
  expect(progress.heading).toBe(Math.atan2(3, 4))
})

it("spends an exact segment budget and consumes a following repeated waypoint", () => {
  const state: PathFollowerState = {
    pos: [0, 0],
    path: [
      [3, 4],
      [3, 4],
    ],
  }
  const progress: PathAdvance = { remaining: 5, consumed: 0, heading: null }
  expect(advancePathWaypoint({ position: state.pos, point: [3, 4], progress })).toBe(true)
  expect(advancePathWaypoint({ position: state.pos, point: [3, 4], progress })).toBe(true)
  expect(state.pos).toEqual([3, 4])
  expect(progress).toEqual({ remaining: 0, consumed: 2, heading: Math.atan2(3, 4) })
})
