import { afterEach, expect, it } from "vitest"
import * as THREE from "three"
import proposal from "#/world/town/floorplan/authored/h-m5"
import { authoredFloorPlan } from "#/world/town/floorplan/authored"
import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { interiorRows } from "#/world/town/interior-rows"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { cutaways } from "#/world/scene/interior"
import { updateCutaways } from "#/world/scene/update-cutaways"
import { setLayout } from "#/world/scene/set-layout"
import { SceneResources } from "#/lib/graphics/scene-resources"

afterEach(() => {
  cutaways.length = 0
})
it.each([0, 1])("uses one designed flight seen from floor %s", (floor) => {
  setLayout(INDOOR)
  const plan = authoredFloorPlan(proposal),
    interior = interiorPlan(
      HOUSES.find((h) => h.id === "h-m5")!,
      floor,
      plan,
    )
  const root = new THREE.Group()
  buildInterior(interior)(root)
  root.updateMatrixWorld(true)
  const floorboards = root.getObjectByName("interior-floor")!
  const floorY = new THREE.Box3().setFromObject(floorboards).max.y
  const front = cutaways.find((wall) => wall.floor === floor && wall.normal[1] === 1)!.obj
  const doorRay = new THREE.Raycaster(new THREE.Vector3(interior.entrance!.point[0], floorY + interior.doorHeight! - 0.02, interior.z1 + 1), new THREE.Vector3(0, 0, -1))
  expect(doorRay.intersectObject(front, true).length === 0).toBe(floor === 0)
  if (floor === 0) {
    doorRay.ray.origin.y = floorY + interior.doorHeight! + 0.02
    expect(doorRay.intersectObject(front, true).length).toBeGreaterThan(0)
  }
  const stairs = root.getObjectByName(`authored-stair:${proposal.stairSections[0].id}`)!
  expect(stairs.children.filter((child) => child.name.startsWith("tread:"))).toHaveLength(13)
  const last = new THREE.Box3().setFromObject(stairs.getObjectByName("tread:0")!)
  expect(last.max.y - floorY).toBeCloseTo((floor === 0 ? 2.34 : -0.18) * ROOM_SCALE)
  expect(stairs.getObjectByName("upper-landing") !== undefined).toBe(floor === 0)
  expect(stairs.getObjectByName("opening-end-guard") !== undefined).toBe(floor === 1)
  const section = interior.stairSections![0],
    geometry = stairGeometry(section)
  const rows = interiorRows(interior),
    at = (x: number, z: number) => rows[Math.floor(z * 2)][Math.floor(x * 2)]
  const landing = geometry.upperLanding,
    opening = geometry.opening
  if (floor === 1) {
    const ray = new THREE.Raycaster(new THREE.Vector3((opening.x0 + opening.x1) / 2, floorY + 1, (opening.z0 + opening.z1) / 2), new THREE.Vector3(0, -1, 0))
    expect(ray.intersectObject(floorboards, true)).toHaveLength(0)
    ray.ray.origin.set((landing.x0 + landing.x1) / 2, floorY + 1, (landing.z0 + landing.z1) / 2)
    expect(ray.intersectObject(floorboards, true).length).toBeGreaterThan(0)
    expect(at((landing.x0 + landing.x1) / 2, (landing.z0 + landing.z1) / 2)).toBe(".")
    expect(at((opening.x0 + opening.x1) / 2, (opening.z0 + opening.z1) / 2)).toBe("#")
    const box = new THREE.Box3().setFromObject(floorboards)
    expect(box.max.y - box.min.y).toBeCloseTo(0.2 * ROOM_SCALE)
    const below = root.getObjectByName("lower-floorboards")!,
      lowerBounds = new THREE.Box3().setFromObject(below)
    expect(floorY - lowerBounds.max.y).toBeCloseTo(2.52 * ROOM_SCALE)
    expect(lowerBounds.max.y - lowerBounds.min.y).toBeCloseTo(0.2 * ROOM_SCALE)
    ray.ray.origin.set((opening.x0 + opening.x1) / 2, floorY + 1, (opening.z0 + opening.z1) / 2)
    const lowerHits = ray.intersectObject(below, true)
    expect(lowerHits.length).toBeGreaterThan(0)
    expect(lowerHits[0].point.y).toBeCloseTo(lowerBounds.max.y)
    const lowerWall = cutaways.find((wall) => wall.floor === 0 && wall.normal[1] === -1)!
    const wallBounds = new THREE.Box3().setFromObject(lowerWall.obj)
    expect(wallBounds.max.y).toBeCloseTo(box.min.y)
    for (let frame = 0; frame < 30; frame++) updateCutaways(new THREE.Vector3(lowerWall.at[0], 4, lowerWall.at[1] - 10))
    root.updateMatrixWorld(true)
    const cutBounds = new THREE.Box3().setFromObject(lowerWall.obj)
    expect(cutBounds.min.y).toBeCloseTo(wallBounds.min.y)
    expect(cutBounds.max.y).toBeLessThan(wallBounds.max.y)
  }
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true)
  })
  new SceneResources(root).dispose()
})
it("mirrors a flight along either axis without changing the designed rises", () => {
  const source = proposal.stairSections[0]
  for (const axis of ["x", "z"] as const)
    for (const lowerEnd of ["start", "end"] as const) {
      const section = { ...source, axis, lowerEnd, x0: 0, z0: 0, x1: axis === "x" ? 6 : 1, z1: axis === "z" ? 6 : 1 }
      const result = stairGeometry(section)
      expect(result.steps[0].height).toBeCloseTo(2.34)
      expect(result.steps[12].height).toBeCloseTo(0.18)
      expect(result.steps.every((step) => step.x0 >= 0 && step.z0 >= 0 && step.x1 <= section.x1 + 1e-9 && step.z1 <= section.z1 + 1e-9)).toBe(true)
    }
})
it("draws the reserved upper chimney shaft at its projected coordinates", () => {
  setLayout(INDOOR)
  const plan = authoredFloorPlan(proposal),
    interior = interiorPlan(
      HOUSES.find((h) => h.id === "h-m5")!,
      1,
      plan,
    ),
    root = new THREE.Group()
  buildInterior(interior)(root)
  const shaft = root.getObjectByName("chimney-shaft")!
  expect(shaft).toBeDefined()
  const box = new THREE.Box3().setFromObject(shaft),
    route = interior.flues![0]
  expect(box.min.x).toBeCloseTo(route.x0)
  expect(box.max.x).toBeCloseTo(route.x1)
  expect(box.min.z).toBeCloseTo(route.z0)
  expect(box.max.z).toBeCloseTo(route.z1)
  expect(box.max.y - box.min.y).toBeCloseTo(interior.wallHeight!)
  new SceneResources(root).dispose()
})
