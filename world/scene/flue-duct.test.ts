import { expect, it } from "vitest"
import * as THREE from "three"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { cutaways } from "#/world/scene/interior"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { SceneResources } from "../../lib/graphics/scene-resources"
it("preserves the authored duct through the upper shaft and the hearth's vertical stack", () => {
  for (const floor of [0, 1]) {
    setLayout(INDOOR)
    const room = INTERIORS.find((r) => r.id === (floor ? "phanthiet-in-h-m5-floor-2" : "phanthiet-in-h-m5"))!,
      root = new THREE.Group()
    try {
      buildInterior(room)(root)
      root.updateMatrixWorld(true)
      const section = room.flues![0],
        y = groundH(room.x0 + 1, room.z0 + 1) + 0.02
      expect(section.wallThickness).toBeCloseTo(0.1 * ROOM_SCALE)
      const mesh = root.getObjectByName(floor ? "chimney-shaft" : "hearth")!
      const x = (section.x0 + section.x1) / 2,
        z = (section.z0 + section.z1) / 2
      const cast = (at: number) => new THREE.Raycaster(new THREE.Vector3(at, y + room.wallHeight! + 0.1, z), new THREE.Vector3(0, -1, 0)).intersectObject(mesh, true)
      const centre = cast(x)
      if (floor) expect(centre).toHaveLength(0)
      else expect(centre.every((hit) => hit.point.y < y + room.furniture.find((f) => f.kind === "hearth")!.hearth!.openingTop - 1e-6)).toBe(true)
      const rim = cast(section.x0 + section.wallThickness / 2)
      expect(rim[0].point.y).toBeCloseTo(y + room.wallHeight!, 5)
    } finally {
      new SceneResources(root).dispose()
      cutaways.length = 0
    }
  }
})
