import { expect, it } from "vitest"
import * as THREE from "three"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { cutaways } from "#/world/scene/interior"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { SceneResources } from "#/lib/graphics/scene-resources"
it("joins the collar underside to the same masonry support from either floor", () => {
  const tops: number[] = []
  for (const floor of [0, 1]) {
    setLayout(INDOOR)
    const room = INTERIORS.find((r) => r.id === (floor ? "phanthiet-in-h-m5-floor-2" : "phanthiet-in-h-m5"))!,
      root = new THREE.Group()
    try {
      buildInterior(room)(root)
      root.updateMatrixWorld(true)
      const shaft = room.flues![0],
        mesh = root.getObjectByName("flue-floor-support")!,
        y = groundH(room.x0 + 1, room.z0 + 1) + 0.02
      expect(shaft.floorSupport.depth).toBeCloseTo(0.2 * ROOM_SCALE)
      expect(shaft.floorSupport.steps).toBe(4)
      const top = y + (floor ? -room.floorThickness! : room.wallHeight!),
        bounds = new THREE.Box3().setFromObject(mesh)
      expect(bounds.max.y).toBeCloseTo(top, 5)
      expect(bounds.min.y).toBeCloseTo(top - shaft.floorSupport.depth, 5)
      const x = shaft.x0 - shaft.floorCollar * 0.1,
        z = (shaft.z0 + shaft.z1) / 2
      const hit = new THREE.Raycaster(new THREE.Vector3(x, top - shaft.floorSupport.depth - 1, z), new THREE.Vector3(0, 1, 0)).intersectObject(mesh, true)[0]
      expect(hit).toBeDefined()
      expect(hit.point.y).toBeCloseTo(top - shaft.floorSupport.depth, 5)
      tops.push(bounds.max.y - y)
    } finally {
      new SceneResources(root).dispose()
      cutaways.length = 0
    }
  }
  const upper = INTERIORS.find((r) => r.id === "phanthiet-in-h-m5-floor-2")!
  expect(tops[0] - tops[1]).toBeCloseTo(upper.below!.drop, 5)
})
