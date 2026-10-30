import { expect, it } from "vitest"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { drawFenceRail } from "#/world/scene/construction/draw-fence-rail"
import { fence } from "#/world/scene/construction/fence"
import { getPastureFence } from "#/world/town/get-pasture-fence"
import { VILLAGE } from "#/world/maps/layout"
import { groundH } from "#/world/scene/ground-h"
import { Group, Raycaster, Vector3 } from "three"

it("removes the actual pasture rail overhang while retaining its sloped timber faces outside the opening", () => {
  const gb = new GB(),
    from: readonly [number, number, number] = [42.4, 1, 31.31818181818182],
    to: readonly [number, number, number] = [42.4, 1.2, 32.23636363636364]
  drawFenceRail({ gb, material: M.wood, from, to, gaps: [[42.4, 31.1]] })
  const group = gb.groups.get(M.wood)
  if (!group) throw new Error("Missing surviving rail")
  const zs = group.pos.filter((_, index) => index % 3 === 2),
    ys = group.pos.filter((_, index) => index % 3 === 1)
  expect(Math.min(...zs)).toBeCloseTo(31.7)
  expect(Math.max(...zs)).toBeCloseTo(to[2])
  expect(Math.min(...ys)).toBeGreaterThan(from[1])
  expect(group.pos).toHaveLength(36)
})

it("keeps a rail without openings and its material, face thickness and full endpoint heights", () => {
  const gb = new GB()
  drawFenceRail({ gb, material: M.woodDark, from: [0, 1, 0], to: [2, 1.2, 0], gaps: [] })
  const group = gb.groups.get(M.woodDark)
  if (!group) throw new Error("Missing rail")
  expect(group.pos.filter((_, index) => index % 3 === 0)).toContain(2)
  expect(group.pos.filter((_, index) => index % 3 === 2)).toEqual(expect.arrayContaining([-0.03, 0.03]))
  expect(Math.max(...group.pos.filter((_, index) => index % 3 === 1))).toBeCloseTo(1.28)
})

it("leaves the real pasture opening clear at both rail heights while retaining the adjacent fence", () => {
  const plan = getPastureFence(VILLAGE.pasture),
    root = new Group()
  fence({ root: root, pts: plan.points, gaps: plan.gaps, h: plan.height })
  root.updateMatrixWorld(true)
  for (const z of [31.4, 31.5, 31.6])
    for (const above of [0.37, 0.4, 0.65, 0.69]) {
      const ray = new Raycaster(new Vector3(41.4, groundH(42.4, z) + above, z), new Vector3(1, 0, 0), 0, 2)
      expect(ray.intersectObject(root, true)).toEqual([])
    }
  const outside = new Raycaster(new Vector3(41.4, groundH(42.4, 31.9) + 0.65, 31.9), new Vector3(1, 0, 0), 0, 2)
  expect(outside.intersectObject(root, true).length).toBeGreaterThan(0)
})
