import { expect, it } from "vitest"
import { SpatialFrame } from "#/lib/engine/spatial-frame"

it.each([0, 1, 2, 3])("preserves physical distances, height and inverse coordinates at rotation %s", (quarterTurns) => {
  const frame = new SpatialFrame({ origin: [-12, 4, 20], width: 8, depth: 6, quarterTurns })
  const first = frame.toWorld([1, 2, 3])
  const second = frame.toWorld([4, 6, 3])
  expect(Math.hypot(second[0] - first[0], second[1] - first[1], second[2] - first[2])).toBe(5)
  expect(first[1]).toBe(6)
  expect(frame.toLocal(first)).toEqual([1, 2, 3])
  const corners = [
    [0, 0],
    [8, 0],
    [0, 6],
    [8, 6],
  ].map((point) => frame.toWorld([point[0], 0, point[1]]))
  expect(Math.min(...corners.map((point) => point[0]))).toBe(-12)
  expect(Math.min(...corners.map((point) => point[2]))).toBe(20)
  expect(Math.max(...corners.map((point) => point[0]))).toBe(-12 + frame.size[0])
  expect(Math.max(...corners.map((point) => point[2]))).toBe(20 + frame.size[1])
})

it("keeps nested room and building coordinates in the same physical frame", () => {
  const building = new SpatialFrame({ origin: [100, 12, 200], width: 8, depth: 6, quarterTurns: 1 })
  const room = new SpatialFrame({ origin: [2, 2.5, 1], width: 3, depth: 4, quarterTurns: 0 })
  const local = [1, 1, 2] satisfies readonly [number, number, number]
  const absolute = building.toWorld(room.toWorld(local))
  expect(absolute).toEqual([103, 15.5, 205])
  expect(room.toLocal(building.toLocal(absolute))).toEqual(local)
})

it("rejects invalid dimensions, rotations and nonfinite origins", () => {
  const valid = { origin: [0, 0, 0] satisfies readonly [number, number, number], width: 8, depth: 6, quarterTurns: 0 }
  for (const invalid of [{ width: 0 }, { depth: -1 }, { width: Infinity }, { quarterTurns: 4 }, { quarterTurns: 0.5 }, { origin: [NaN, 0, 0] satisfies readonly [number, number, number] }]) {
    expect(() => new SpatialFrame({ ...valid, ...invalid })).toThrow(RangeError)
  }
})

it("keeps its coordinate frame fixed when the caller later edits the source values", () => {
  const origin: [number, number, number] = [10, 2, 20]
  const source = { origin, width: 8, depth: 6, quarterTurns: 1 }
  const frame = new SpatialFrame(source)
  origin[0] = 100
  source.width = 80
  source.quarterTurns = 0
  expect(frame.toWorld([1, 3, 2])).toEqual([12, 5, 27])
  expect(frame.size).toEqual([6, 8])
  expect(Object.isFrozen(frame)).toBe(true)
})

it("rejects nonfinite coordinates and directions at the transform boundary", () => {
  const frame = new SpatialFrame({ origin: [0, 0, 0], width: 8, depth: 6, quarterTurns: 0 })
  for (const invalid of [NaN, Infinity, -Infinity]) {
    expect(() => frame.toWorld([invalid, 0, 0])).toThrow(RangeError)
    expect(() => frame.toLocal([0, invalid, 0])).toThrow(RangeError)
    expect(() => frame.direction([0, 0, invalid])).toThrow(RangeError)
  }
})
it("rejects overflowing height addition and inverse subtraction from finite inputs", () => {
  const upper = new SpatialFrame({ origin: [0, Number.MAX_VALUE, 0], width: 8, depth: 6, quarterTurns: 0 })
  const lower = new SpatialFrame({ origin: [0, -Number.MAX_VALUE, 0], width: 8, depth: 6, quarterTurns: 0 })
  expect(() => upper.toWorld([0, Number.MAX_VALUE, 0])).toThrow(RangeError)
  expect(() => lower.toLocal([0, Number.MAX_VALUE, 0])).toThrow(RangeError)
})
it("rejects an overflowing rotated point without clamping it into the frame", () => {
  const frame = new SpatialFrame({ origin: [0, 0, 0], width: Number.MAX_VALUE, depth: 6, quarterTurns: 2 })
  expect(() => frame.toWorld([-Number.MAX_VALUE, 0, 0])).toThrow(RangeError)
  expect(() => frame.toLocal([-Number.MAX_VALUE, 0, 0])).toThrow(RangeError)
})
it("rejects incomplete runtime coordinates despite their static tuple type", () => {
  const source = { origin: [0, 0, 0] satisfies [number, number, number], width: 8, depth: 6, quarterTurns: 0 }
  for (const origin of [[], [0, 0], new Array<number>(3), null, {}]) {
    Object.assign(source, { origin })
    expect(() => new SpatialFrame(source)).toThrow(RangeError)
  }
})

it.each([0, 1, 2, 3])("rejects a frame whose rotated extent collapses at a large origin, rotation=%s", (quarterTurns) => {
  expect(() => new SpatialFrame({ origin: [1e20, 0, 1e20], width: 8, depth: 6, quarterTurns })).toThrow(RangeError)
  expect(() => new SpatialFrame({ origin: [-1e20, 0, -1e20], width: 8, depth: 6, quarterTurns })).toThrow(RangeError)
})
it.each([0, 1, 2, 3])("rejects a frame whose rotated extent overflows, rotation=%s", (quarterTurns) => {
  expect(() => new SpatialFrame({ origin: [Number.MAX_VALUE, 0, Number.MAX_VALUE], width: Number.MAX_VALUE, depth: Number.MAX_VALUE, quarterTurns })).toThrow(RangeError)
})
