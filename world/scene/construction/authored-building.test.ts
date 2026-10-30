import { expect, it } from "vitest"
import * as THREE from "three"
import proposal from "../../town/floorplan/authored/h-m5"
import { authoredBuilding } from "./authored-building"
import { SceneResources } from "../../../lib/graphics/scene-resources"
import { TILE_M } from "#/world/town/fit"

it("uses the site dimensions, roof elevation, supported flue and entry stair", () => {
  const site = proposal.exterior!,
    root = new THREE.Group()
  const mesh = authoredBuilding(root, site, () => 0)
  root.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(mesh)
  expect((site.bounds[2] - site.bounds[0]) * TILE_M).toBeCloseTo(proposal.width * proposal.cellM)
  expect((site.bounds[3] - site.bounds[1]) * TILE_M).toBeCloseTo(proposal.depth * proposal.cellM)
  expect((site.eaveY - site.floorY) * TILE_M).toBeCloseTo(4.72)
  expect((site.ridgeY - site.floorY) * TILE_M).toBeCloseTo(6.5)
  expect(site.steps).toHaveLength(7)
  expect(site.steps[0].height).toBe(site.floorY)
  expect(site.steps[6].height * TILE_M).toBeCloseTo(0.05)
  expect(bounds.min.x).toBeCloseTo(site.bounds[0] - site.overhang)
  expect(bounds.max.x).toBeCloseTo(site.bounds[2] + site.overhang)
  expect(bounds.max.y).toBeCloseTo(site.chimneys[0].top)
  const [x, z] = site.door.point,
    [nx, nz] = site.door.outward
  const ray = new THREE.Raycaster(new THREE.Vector3(x + nx * 0.1, site.floorY + site.door.height - 0.02, z + nz * 0.1), new THREE.Vector3(-nx, 0, -nz))
  const shell = mesh.getObjectByName("building-envelope")!
  expect(ray.intersectObject(shell, true).filter((hit) => hit.distance < 0.2)).toHaveLength(0)
  ray.ray.origin.y = site.floorY + site.door.height + 0.02
  expect(ray.intersectObject(shell, true).some((hit) => hit.distance < 0.2)).toBe(true)
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true)
  })
  new SceneResources(root).dispose()
})
it("rejects terrain above the designed entry steps instead of raising them", () => {
  expect(() => authoredBuilding(new THREE.Group(), proposal.exterior!, () => 1)).toThrow("Entry step intersects its terrain")
})

it("recesses the exterior leaf to the interior wall face and preserves the clear aperture", () => {
  const site = proposal.exterior!,
    root = new THREE.Group(),
    mesh = authoredBuilding(root, site, () => 0)
  root.updateMatrixWorld(true)
  expect(site.door.recess * TILE_M).toBeCloseTo(proposal.cellM)
  const [x, z] = site.door.point,
    [nx, nz] = site.door.outward,
    tx = -nz,
    tz = nx
  const rayAt = (u: number) => new THREE.Raycaster(new THREE.Vector3(x + tx * u + nx, site.floorY + site.door.height * 0.4, z + tz * u + nz), new THREE.Vector3(-nx, 0, -nz))
  const panel = mesh.getObjectByName("entry-door-panel")!,
    frame = mesh.getObjectByName("entry-door-frame")!
  const envelope = site.door.leafThickness + 2 * Math.max(site.door.braceProjection, site.door.handleProjection)
  const bounds = new THREE.Box3().setFromObject(panel)
  const depth = nx ? bounds.max.x - bounds.min.x : bounds.max.z - bounds.min.z
  expect(depth).toBeCloseTo(envelope)
  const gripU = site.door.hingeSign * (site.door.width / 2 - site.door.frameInset - site.door.handleAlong)
  const gripRay = rayAt(gripU)
  gripRay.ray.origin.y = site.floorY + site.door.leafBottom + (site.door.leafTop - site.door.leafBottom) * 0.53
  expect(gripRay.intersectObject(panel, true)[0].distance).toBeCloseTo(1 + site.door.recess - site.door.leafThickness / 2 - site.door.handleProjection)
  const gapRay = rayAt(0)
  gapRay.ray.origin.y = site.floorY + site.door.leafBottom / 2
  expect(gapRay.intersectObject(panel, true)).toHaveLength(0)
  gapRay.ray.origin.y = site.floorY + (site.door.leafTop + site.door.height) / 2
  expect(gapRay.intersectObject(panel, true)).toHaveLength(0)
  const hits = rayAt(0).intersectObject(panel, true)
  expect(hits.length).toBeGreaterThan(0)
  expect(hits[0].distance).toBeCloseTo(1 + site.door.recess - site.door.leafThickness / 2)
  const half = site.door.width / 2 - site.door.frameInset
  for (const side of [-1, 1]) {
    expect(rayAt(side * (half - 0.001)).intersectObject(frame, true)).toHaveLength(0)
    expect(rayAt(side * (half + site.door.frameInset / 2)).intersectObject(frame, true).length).toBeGreaterThan(0)
  }
  new SceneResources(root).dispose()
})

it("leaves the chimney duct open through both the roof and the outlet", () => {
  const site = proposal.exterior!,
    root = new THREE.Group()
  try {
    const mesh = authoredBuilding(root, site, () => 0)
    root.updateMatrixWorld(true)
    const chimney = site.chimneys[0],
      [x0, z0, x1, z1] = chimney.rect
    const cast = (x: number, z: number) => new THREE.Raycaster(new THREE.Vector3(x, chimney.top + 1, z), new THREE.Vector3(0, -1, 0)).intersectObject(mesh.getObjectByName("building-envelope")!, true)
    const centre = cast((x0 + x1) / 2, (z0 + z1) / 2)
    expect(centre.filter((hit) => hit.point.y > site.eaveY + 1e-6)).toHaveLength(0)
    const rim = cast(x0 + chimney.wallThickness / 2, (z0 + z1) / 2)
    expect(rim[0].point.y).toBeCloseTo(chimney.top)
    const roof = cast(x0 - chimney.wallThickness, (z0 + z1) / 2)
    expect(roof[0].point.y).toBeGreaterThan(site.eaveY)
    expect(roof[0].point.y).toBeLessThan(site.ridgeY)
  } finally {
    new SceneResources(root).dispose()
  }
})
