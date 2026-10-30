import { expect, it } from "vitest"
import { subtractCuboids, type Cuboid } from "#/lib/engine/cuboid-subtraction"
const volume = (r: Cuboid) => (r.x1 - r.x0) * (r.z1 - r.z0) * (r.top - r.bottom)
const contains = (r: Cuboid, x: number, y: number, z: number) => x > r.x0 && x < r.x1 && y > r.bottom && y < r.top && z > r.z0 && z < r.z1
it("subtracts connected horizontal and vertical voids without filling their junction", () => {
  const source = { x0: 0, z0: 0, x1: 3, z1: 3, bottom: 0, top: 3 },
    front = { x0: 1, z0: 0, x1: 2, z1: 2, bottom: 1, top: 2 },
    shaft = { x0: 1, z0: 1, x1: 2, z1: 2, bottom: 2, top: 3 }
  const parts = subtractCuboids(source, [front, shaft])
  expect(parts.reduce((v, p) => v + volume(p), 0)).toBe(24)
  for (let x = 0.25; x < 3; x += 0.5)
    for (let y = 0.25; y < 3; y += 0.5)
      for (let z = 0.25; z < 3; z += 0.5) {
        const solid = contains(source, x, y, z) && !contains(front, x, y, z) && !contains(shaft, x, y, z)
        expect(parts.filter((p) => contains(p, x, y, z))).toHaveLength(solid ? 1 : 0)
      }
  expect(subtractCuboids(source, [source])).toEqual([])
  expect(subtractCuboids(source, [{ ...source, x0: 4, x1: 5 }])).toEqual([source])
})
