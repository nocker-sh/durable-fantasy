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
it("renders the owned iron tool with a narrow handle inside its actual shelf", () => {
  setLayout(INDOOR)
  const room = INTERIORS.find((r) => r.id === "phanthiet-in-h-m5")!,
    root = new THREE.Group()
  try {
    buildInterior(room)(root)
    root.updateMatrixWorld(true)
    const rack = room.furniture.find((f) => f.shelf?.items?.some((i) => i.kind === "tool"))!,
      props = root.getObjectByName("interior-furniture")!
    const y = groundH(room.x0 + 1, room.z0 + 1) + 0.02 + 0.6 * ROOM_SCALE
    const cast = (offset: number) => new THREE.Raycaster(new THREE.Vector3(rack.x + rack.w / 2 + 0.2, y, rack.z + offset), new THREE.Vector3(-1, 0, 0)).intersectObject(props, true)[0]
    expect((cast(0).object as THREE.Mesh).material).toBe(M.iron)
    expect((cast(0.05 * ROOM_SCALE).object as THREE.Mesh).material).toBe(M.woodDark)
  } finally {
    new SceneResources(root).dispose()
    cutaways.length = 0
  }
})
