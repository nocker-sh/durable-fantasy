import { expect, it } from "vitest"
import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { SpatialFrameChain } from "#/lib/engine/spatial-frame-chain"
import type { Vector3 } from "#/lib/engine/vector3-types"

const turns = [0, 1, 2, 3].flatMap((inner) => [0, 1, 2, 3].map((outer) => ({ inner, outer })))
it.each(turns)("composes and inverts quarter turns $inner and $outer in physical order", (input) => {
  const inner = new SpatialFrame({ origin: [1, 2, 1], width: 2, depth: 3, quarterTurns: input.inner })
  const outer = new SpatialFrame({ origin: [100, 5, 200], width: 8, depth: 6, quarterTurns: input.outer })
  const chain = new SpatialFrameChain({ frames: [inner, outer] }),
    point: Vector3 = [0.25, 1, 0.75]
  const expected = outer.toWorld(inner.toWorld(point))
  expect(chain.toWorld(point)).toEqual(expected)
  expect(chain.toLocal(expected)).toEqual(point)
  expect(point).toEqual([0.25, 1, 0.75])
})
it("owns the frame sequence and freezes the chain", () => {
  const frames = [new SpatialFrame({ origin: [100, 5, 200], width: 8, depth: 6, quarterTurns: 0 })]
  const chain = new SpatialFrameChain({ frames })
  frames.pop()
  expect(chain.toWorld([1, 2, 3])).toEqual([101, 7, 203])
  expect(Object.isFrozen(chain)).toBe(true)
})
it("copies a root-local point for an empty chain without inventing an offset", () => {
  const chain = new SpatialFrameChain({ frames: [] }),
    point: Vector3 = [1, 2, 3]
  expect(chain.toWorld(point)).toEqual(point)
  expect(chain.toLocal(point)).toEqual(point)
  expect(chain.toWorld(point)).not.toBe(point)
  expect(chain.toLocal(point)).not.toBe(point)
})
it.each([[], [1, 2], [1, 2, 3, 4], [NaN, 2, 3], [1, Infinity, 3]].map((value) => ({ value })))("validates points even without a frame: %j", (input) => {
  const chain = new SpatialFrameChain({ frames: [] }),
    request = { point: [1, 2, 3] satisfies Vector3 }
  Object.assign(request, { point: input.value })
  expect(() => chain.toWorld(request.point)).toThrow("Invalid spatial frame chain point")
  expect(() => chain.toLocal(request.point)).toThrow("Invalid spatial frame chain point")
})
it("rejects missing frame instances rather than skipping a sparse layer", () => {
  const frames: SpatialFrame[] = []
  frames.length = 1
  expect(() => new SpatialFrameChain({ frames })).toThrow("Invalid spatial frame chain")
  Object.assign(frames, { 0: {} })
  expect(() => new SpatialFrameChain({ frames })).toThrow("Invalid spatial frame chain")
})
it("rejects overflow introduced by composing individually finite frame heights", () => {
  const frame = new SpatialFrame({ origin: [0, Number.MAX_VALUE, 0], width: 1, depth: 1, quarterTurns: 0 })
  const chain = new SpatialFrameChain({ frames: [frame, frame] })
  expect(() => chain.toWorld([0, 0, 0])).toThrow("Unbounded spatial frame position")
  expect(() => chain.toLocal([0, -Number.MAX_VALUE, 0])).toThrow("Unbounded spatial frame local position")
})
