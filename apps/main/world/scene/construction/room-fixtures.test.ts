import { afterEach, expect, it } from "vitest"
import * as THREE from "three"
import proposal from "#/world/town/floorplan/authored/h-m5"
import { authoredFloorPlan } from "#/world/town/floorplan/authored-floor-plan"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { interiorRows } from "#/world/town/interior-rows"
import { buildInterior } from "#/world/scene/build-interior"
import { cutaways } from "#/world/scene/interior"
import { INDOOR } from "#/world/maps/layouts/indoor"
import { updateCutaways } from "#/world/scene/update-cutaways"
import { authoredBuilding } from "#/world/scene/construction/authored-building"
import { setLayout } from "#/world/scene/set-layout"
import { SceneResources } from "#/lib/graphics/scene-resources"
afterEach(() => {
  cutaways.length = 0
})
it("cuts the exterior wall at each compiled window and keeps solid wall below its sill", () => {
  const root = new THREE.Group(),
    site = proposal.exterior!
  authoredBuilding(root, site, () => 0)
  root.updateMatrixWorld(true)
  const shell = root.getObjectByName("building-envelope")!
  for (const w of site.windows) {
    expect(root.getObjectByName(`window:${w.id}`)).toBeDefined()
    const [x, z] = w.point,
      [nx, nz] = w.outward
    const ray = new THREE.Raycaster(new THREE.Vector3(x + nx * 0.1, site.floorY + w.sill + w.height / 2, z + nz * 0.1), new THREE.Vector3(-nx, 0, -nz))
    expect(ray.intersectObject(shell, true).filter((hit) => hit.distance < 0.2)).toHaveLength(0)
    ray.ray.origin.y = site.floorY + w.sill - 0.05
    expect(ray.intersectObject(shell, true).some((hit) => hit.distance < 0.2)).toBe(true)
  }
  new SceneResources(root).dispose()
})
it.each([0, 1])("shares openings and declared hanging lights on indoor floor %s", (floor) => {
  setLayout(INDOOR)
  const it = interiorPlan(
      HOUSES.find((h) => h.id === "h-m5")!,
      floor,
      authoredFloorPlan(proposal),
    ),
    root = new THREE.Group()
  buildInterior(it)(root)
  root.updateMatrixWorld(true)
  const floorY = new THREE.Box3().setFromObject(root.getObjectByName("interior-floor")!).max.y
  for (const w of it.windows ?? []) {
    const wall = cutaways.find((c) => c.floor === floor && c.normal[0] === w.outward[0] && c.normal[1] === w.outward[1])!
    const [x, z] = w.point,
      [nx, nz] = w.outward
    const ray = new THREE.Raycaster(new THREE.Vector3(x + nx * 0.1, floorY + w.sill + w.height / 2, z + nz * 0.1), new THREE.Vector3(-nx, 0, -nz))
    expect(ray.intersectObject(wall.obj, true)).toHaveLength(0)
    const pane = root.getObjectByName(`window:${w.id}`)!
    expect(wall.details).toContain(pane)
    updateCutaways(new THREE.Vector3(x + nx * 10, 5, z + nz * 10))
    expect(pane.visible).toBe(false)
    const rows = interiorRows(it),
      insideX = x - (nx * w.depth) / 2,
      insideZ = z - (nz * w.depth) / 2
    expect(rows[Math.floor(insideZ * 2)][Math.floor(insideX * 2)]).toBe("#")
  }
  expect(root.children.filter((c) => c.name.startsWith("lamp:"))).toHaveLength(it.lamps!.length)
  for (const f of it.lamps ?? []) {
    const lamp = root.getObjectByName(`lamp:${f.id}`)!,
      box = new THREE.Box3().setFromObject(lamp)
    expect(box.min.y - floorY).toBeCloseTo(f.bottom)
    expect(box.max.y - floorY).toBeCloseTo(f.ceiling)
    expect(box.max.x - box.min.x).toBeCloseTo(f.diameter)
  }
  new SceneResources(root).dispose()
})
