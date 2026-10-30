import { expect, it } from "vitest"
import { GridPathfinder } from "#/lib/engine/pathfinder"

it("fixes grid dimensions while continuing to read live occupancy", () => {
  const props = { blocked: new Uint8Array(25), size: 5, resolution: 1, clearance: 0.2 }
  const paths = new GridPathfinder(props)
  props.size = 1
  props.resolution = 8
  props.clearance = 4
  expect(paths.find([0.5, 0.5], [4.5, 0.5], true)).toHaveLength(5)
  for (const row of [0, 1, 2, 3, 4]) props.blocked[row * 5 + 2] = 1
  expect(paths.find([0.5, 0.5], [4.5, 0.5], true)).toBeNull()
  expect(Object.isFrozen(paths)).toBe(true)
})

it("keeps clearance local to each pathfinder", () => {
  const blocked = new Uint8Array(25)
  blocked[1 * 5 + 2] = 1
  const narrow = new GridPathfinder({ blocked, size: 5, resolution: 1, clearance: 0 })
  const wide = new GridPathfinder({ blocked, size: 5, resolution: 1, clearance: 0.6 })
  expect(narrow.find([0.5, 2.5], [4.5, 2.5])).toHaveLength(2)
  expect(wide.find([0.5, 2.5], [4.5, 2.5])?.length).toBeGreaterThan(2)
})

it("rejects invalid configuration before allocating a search", () => {
  const props = { blocked: new Uint8Array(25), size: 5, resolution: 1, clearance: 0.2 }
  for (const clearance of [-1, NaN, Infinity]) expect(() => new GridPathfinder({ ...props, clearance })).toThrow(RangeError)
  for (const resolution of [0, -1, NaN, Infinity]) expect(() => new GridPathfinder({ ...props, resolution })).toThrow(RangeError)
  expect(() => new GridPathfinder({ ...props, size: 6 })).toThrow(RangeError)
})
