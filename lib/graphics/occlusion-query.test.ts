import { afterEach, expect, it, vi } from "vitest"
import { Box3, Ray, Vector3 } from "three"
import { OcclusionQuery } from "./occlusion-query"

afterEach(() => vi.restoreAllMocks())
const box = (z: number) => new Box3(new Vector3(-1, -1, z), new Vector3(1, 1, z + 1))

it("tests stationary endpoints once and recomputes when either endpoint moves", () => {
  const intersect = vi.spyOn(Ray.prototype, "intersectBox")
  const query = new OcclusionQuery([box(4), box(12)], 0.3)
  const from = new Vector3(0, 0, 0),
    to = new Vector3(0, 0, 10)
  for (let frame = 0; frame < 600; frame++) expect(query.update(from, to)).toEqual([true, false])
  expect(intersect).toHaveBeenCalledTimes(2)
  from.set(10, 0, 0)
  expect(query.update(from, to)).toEqual([false, false])
  to.set(0, 0, 5)
  expect(query.update(from, to)).toEqual([true, false])
  expect(intersect).toHaveBeenCalledTimes(6)
})

it("matches direct ray tests, including boxes behind the target and the clearance boundary", () => {
  const boxes = [box(-3), box(1), box(4), box(9.7), box(12)]
  const query = new OcclusionQuery(boxes, 0.3)
  const point = new Vector3()
  for (const from of [new Vector3(), new Vector3(3, 2, -1), new Vector3(0, 0, 4.5)]) {
    for (const to of [new Vector3(0, 0, 10), new Vector3(0, 0, 1), from.clone()]) {
      const ray = new Ray(from, to.clone().sub(from).normalize())
      const expected = boxes.map((b) => !!ray.intersectBox(b, point) && point.distanceTo(from) < from.distanceTo(to) - 0.3)
      expect(query.update(from, to)).toEqual(expected)
    }
  }
})
