import { expect, it } from "vitest"
import { getInteriorFloorSpace } from "#/world/town/get-interior-floor-space"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { overlap } from "#/world/town/floorplan/overlap"

function fixture() {
  const source = INTERIORS.find((interior) => interior.authored && interior.floor === 1)
  if (!source) throw new Error("Missing measured floor")
  return { ...structuredClone(source), x0: 10, z0: 20, x1: 16, z1: 26, floorThickness: 0.25 * ROOM_SCALE, flues: [], floorOpenings: [{ x0: 11.5, z0: 21.5, x1: 13, z1: 23 }] }
}
it("retains the measured thickness and exact stair hole when converting the floor to metres", () => {
  const interior = fixture(),
    before = structuredClone(interior),
    floor = getInteriorFloorSpace(interior, 0.25)
  expect(floor.thicknessMetres).toBe(0.25)
  expect(floor.footprint.reduce((area, rect) => area + (rect.x1 - rect.x0) * (rect.z1 - rect.z0), 0)).toBe(15)
  expect(floor.footprint.some((rect) => overlap(rect, { x0: 1, z0: 1, x1: 2, z1: 2 }))).toBe(false)
  expect(interior).toEqual(before)
})
it("preserves flue holes while counting timber and stone collars only once", () => {
  const interior = fixture(),
    shaft = INTERIORS.find((room) => room.authored && room.floor === 1)?.flues?.[0]
  if (!shaft) throw new Error("Missing flue fixture")
  const floor = getInteriorFloorSpace({ ...interior, flues: [{ ...shaft, x0: 14.5, z0: 24.5, x1: 16, z1: 26, floorCollar: 0.15 }] }, 0.25)
  expect(floor.footprint.reduce((area, rect) => area + (rect.x1 - rect.x0) * (rect.z1 - rect.z0), 0)).toBeCloseTo(14, 12)
  expect(floor.footprint.some((rect) => overlap(rect, { x0: 3, z0: 3, x1: 4, z1: 4 }))).toBe(false)
})
it("does not substitute a rendering fallback for missing or mismatched measured thickness", () => {
  expect(() => getInteriorFloorSpace({ ...fixture(), floorThickness: undefined }, 0.25)).toThrow("floor thickness disagrees")
  expect(() => getInteriorFloorSpace(fixture(), 0.5)).toThrow("floor thickness disagrees")
})
it("rejects malformed openings instead of losing the whole slab during subtraction", () => {
  expect(() => getInteriorFloorSpace({ ...fixture(), floorOpenings: [{ x0: NaN, z0: 21, x1: 12, z1: 22 }] }, 0.25)).toThrow("Invalid interior floor opening")
})
