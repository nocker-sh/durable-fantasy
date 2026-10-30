import { expect, it } from "vitest"
import { assertPathfinderGrid } from "#/lib/engine/assert-pathfinder-grid"

const valid = { blocked: new Uint8Array(5), size: 2, resolution: 0.5, clearance: 0 }

it("accepts zero clearance and spare occupancy storage without changing either", () => {
  const snapshot = structuredClone(valid)
  expect(assertPathfinderGrid(valid)).toBeUndefined()
  expect(valid).toEqual(snapshot)
})

it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid grid size %s", (size) => {
  expect(() => assertPathfinderGrid({ ...valid, size })).toThrow("Invalid pathfinder grid")
})

it.each([0, -1, NaN, Infinity])("rejects invalid sampling resolution %s", (resolution) => {
  expect(() => assertPathfinderGrid({ ...valid, resolution })).toThrow(RangeError)
})

it.each([-1, NaN, Infinity])("rejects invalid body clearance %s", (clearance) => {
  expect(() => assertPathfinderGrid({ ...valid, clearance })).toThrow(RangeError)
})

it("rejects occupancy shorter than the declared square grid", () => {
  expect(() => assertPathfinderGrid({ ...valid, blocked: new Uint8Array(3) })).toThrow(RangeError)
})
