import { expect, it } from "vitest"
import { Polyline, type V2 } from "./polyline"

it("matches direct distances for curved paths, endpoints and repeated points", () => {
  const paths: V2[][] = [
    [],
    [[2, 3]],
    [
      [0, 0],
      [0, 0],
      [4, 0],
      [4, 3],
    ],
    Polyline.catmull([
      [0, 0],
      [3, 8],
      [9, -2],
      [12, 4],
    ]),
  ]
  for (const points of paths) {
    const path = new Polyline(points)
    for (let x = -3; x <= 15; x += 0.375) for (let z = -5; z <= 10; z += 0.375) expect(path.distance(x, z)).toBe(Polyline.distance(x, z, points))
  }
})

it("keeps a stable snapshot when the source path changes", () => {
  const points: V2[] = [
    [0, 0],
    [4, 0],
  ]
  const path = new Polyline(points)
  points[0][1] = 10
  points.push([2, 2])
  expect(path.distance(2, 2)).toBe(2)
  expect(Polyline.distance(2, 2, points)).toBe(0)
})

it("keeps endpoint, repeated-point and empty-path distance semantics", () => {
  expect(new Polyline([]).distance(2, 3)).toBe(Math.sqrt(1e9))
  const repeated = new Polyline([
    [1, 2],
    [1, 2],
  ])
  expect(repeated.distance(4, 6)).toBe(5)
  const segment = new Polyline([
    [0, 0],
    [4, 0],
  ])
  expect(segment.distance(-3, 4)).toBe(5)
  expect(segment.distance(7, 4)).toBe(5)
  expect(segment.distance(2, 3)).toBe(3)
})

it("prevents replacing behavior on an immutable path snapshot", () => {
  const path = new Polyline([
    [0, 0],
    [4, 0],
  ])
  expect(Object.isFrozen(path)).toBe(true)
  expect(Reflect.set(path, "distance", () => 0)).toBe(false)
  expect(path.distance(2, 3)).toBe(3)
})
