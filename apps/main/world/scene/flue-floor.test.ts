import { expect, it } from "vitest"
import * as THREE from "three"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/layouts/indoor"
import { cutaways } from "#/world/scene/interior"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { M } from "#/world/scene/construction/materials"
import { SceneResources } from "#/lib/graphics/scene-resources"
it("cuts the actual timber mesh and fills only the stone collar through the floor thickness", () => {
  setLayout(INDOOR)
  const room = INTERIORS.find((r) => r.id === "phanthiet-in-h-m5-floor-2")!,
    root = new THREE.Group()
  try {
    buildInterior(room)(root)
    root.updateMatrixWorld(true)
    const mesh = root.getObjectByName("interior-floor")!,
      shaft = room.flues![0]
    expect(shaft.floorCollar).toBeCloseTo(0.15 * ROOM_SCALE)
    const y = groundH(room.x0 + 1, room.z0 + 1) + 0.02,
      z = (shaft.z0 + shaft.z1) / 2
    const rayAt = (x: number, up = false) =>
      new THREE.Raycaster(new THREE.Vector3(x, up ? y - room.floorThickness! - 0.1 : y + 0.1, z), new THREE.Vector3(0, up ? 1 : -1, 0)).intersectObject(mesh, true)[0]
    expect(rayAt((shaft.x0 + shaft.x1) / 2)).toBeUndefined()
    const stone = rayAt(shaft.x0 - shaft.floorCollar / 2)
    expect(stone).toBeDefined()
    expect((stone!.object as THREE.Mesh).material).toBe(M.stone)
    expect(stone!.point.y).toBeCloseTo(y, 5)
    expect(rayAt(shaft.x0 - shaft.floorCollar / 2, true)!.point.y).toBeCloseTo(y - room.floorThickness!, 5)
    expect((rayAt(shaft.x0 - shaft.floorCollar - 0.1)!.object as THREE.Mesh).material).toBe(M.wood)
  } finally {
    new SceneResources(root).dispose()
    cutaways.length = 0
  }
})
