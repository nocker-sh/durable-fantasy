import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import type { PathFollowerState } from "#/lib/engine/path-follower-types"
import { expect, it } from "vitest"
import { PathFollower } from "#/lib/engine/path-follower"

const follower = new PathFollower({ speed: 2.4 })
it.each([5, 10, 30, 60, 144])("preserves distance across cell boundaries at %s fps", (fps) => {
  const state: PathFollowerState = { pos: [0, 0], path: Array.from({ length: 80 }, (_, i): Vector2Tuple => [(i + 1) * 0.5, 0]) }
  for (let frame = 0; frame < fps * 10; frame++) follower.advance(state, 1 / fps)
  expect(state.pos[0]).toBeCloseTo(24, 9)
  expect(state.pos[1]).toBe(0)
})
it("spends leftover distance around corners and stops at the path end after a long gap", () => {
  const state: PathFollowerState = {
    pos: [0, 0],
    path: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  }
  const position = state.pos
  expect(follower.advance(state, 0.5)).toBe(0)
  expect(state.pos[0]).toBe(1)
  expect(state.pos[1]).toBeCloseTo(0.2)
  expect(state.path).toEqual([
    [1, 1],
    [2, 1],
  ])
  follower.advance(state, 60)
  expect(state.pos).toEqual([2, 1])
  expect(state.pos).toBe(position)
  expect(state.path).toEqual([])
  expect(follower.advance(state, 1)).toBeNull()
})
it("leaves the route unchanged for invalid or nonpositive elapsed time", () => {
  for (const seconds of [0, -1, NaN, Infinity]) {
    const state: PathFollowerState = { pos: [0, 0], path: [[1, 1]] }
    expect(follower.advance(state, seconds)).toBeNull()
    expect(state).toEqual({ pos: [0, 0], path: [[1, 1]] })
  }
})

it("snapshots speed while preserving the caller's position and route references", () => {
  const props = { speed: 2 }
  const fixed = new PathFollower(props)
  props.speed = 20
  const state: PathFollowerState = {
    pos: [0, 0],
    path: [
      [0, 1],
      [0, 2],
    ],
  }
  const position = state.pos
  const path = state.path
  fixed.advance(state, 0.75)
  expect(state.pos).toEqual([0, 1.5])
  expect(state.pos).toBe(position)
  expect(state.path).toBe(path)
  expect(state.path).toEqual([[0, 2]])
  expect(Object.isFrozen(fixed)).toBe(true)
})
