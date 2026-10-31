import { expect, it, vi } from "vitest"
import { Group, Raycaster, Vector3 } from "three"
import { getGroundHit } from "#/lib/graphics/get-ground-hit"

function fixture() {
  const terrain = new Group()
  const structures = new Group()
  const ray = new Raycaster()
  const intersect = vi.spyOn(ray, "intersectObject")
  const isFree = vi.fn<(x: number, z: number) => boolean>()
  return { terrain, structures, ray, intersect, isFree }
}

it("prefers free ground behind a building without asking for a structural surface", () => {
  const f = fixture()
  f.intersect.mockReturnValueOnce([{ distance: 5, point: new Vector3(2, 0, 3), object: f.terrain }])
  f.isFree.mockReturnValue(true)
  expect(getGroundHit(f)).toEqual([2, 3])
  expect(f.intersect).toHaveBeenCalledExactlyOnceWith(f.terrain)
  expect(f.isFree).toHaveBeenCalledExactlyOnceWith(2, 3)
})

it("finds the first free structural surface when terrain is blocked", () => {
  const f = fixture()
  f.intersect.mockReturnValueOnce([{ distance: 8, point: new Vector3(2, 0, 3), object: f.terrain }]).mockReturnValueOnce([
    { distance: 2, point: new Vector3(4, 2, 5), object: f.structures },
    { distance: 3, point: new Vector3(6, 1, 7), object: f.structures },
    { distance: 4, point: new Vector3(8, 0, 9), object: f.structures },
  ])
  f.isFree.mockImplementation((x) => x >= 6)
  expect(getGroundHit(f)).toEqual([6, 7])
  expect(f.intersect.mock.calls).toEqual([[f.terrain], [f.structures, true]])
  expect(f.isFree.mock.calls).toEqual([
    [2, 3],
    [4, 5],
    [6, 7],
  ])
})

it("still returns blocked terrain for the caller to validate when no structure is free", () => {
  const f = fixture()
  f.intersect.mockReturnValueOnce([{ distance: 8, point: new Vector3(2, 0, 3), object: f.terrain }]).mockReturnValueOnce([])
  f.isFree.mockReturnValue(false)
  expect(getGroundHit(f)).toEqual([2, 3])
})

it("uses structures if the ray misses terrain, or returns null if it misses both", () => {
  const f = fixture()
  f.intersect.mockReturnValueOnce([]).mockReturnValueOnce([{ distance: 3, point: new Vector3(6, 1, 7), object: f.structures }])
  f.isFree.mockReturnValue(true)
  expect(getGroundHit(f)).toEqual([6, 7])
  f.intersect.mockReturnValue([])
  expect(getGroundHit(f)).toBeNull()
})
