import { expect, it } from "vitest"
import * as THREE from "three"
import { INTERIORS } from "#/world/town/interiors"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { cutaways } from "#/world/scene/interior"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { SceneResources } from "#/lib/graphics/scene-resources"
it("draws each owned paper bundle on its assigned board rather than inventing stock", () => {
  setLayout(INDOOR)
  const room = INTERIORS.find((r) => r.id === "phanthiet-in-h-m5-floor-2")!,
    root = new THREE.Group()
  try {
    buildInterior(room)(root)
    root.updateMatrixWorld(true)
    const furniture = root.getObjectByName("interior-furniture")!,
      floor = groundH(room.x0 + 1, room.z0 + 1) + 0.02
    const shelves = room.furniture.filter((f) => f.shelf)
    expect(shelves).toHaveLength(3)
    for (const f of shelves) {
      const items = shelfItemParts({ x: f.x, z: f.z, width: f.w, depth: f.d, floor: floor, shelf: f.shelf! })
      for (let i = 0; i < items.length; i++) {
        const item = items[i],
          support = f.shelf!.items![i].board,
          above = floor + f.shelf!.levels[support + 1] - f.shelf!.board - 0.001
        const ray = new THREE.Raycaster(new THREE.Vector3((item.x0 + item.x1) / 2, above, (item.z0 + item.z1) / 2), new THREE.Vector3(0, -1, 0))
        expect(ray.intersectObject(furniture, true)[0]?.point.y).toBeCloseTo(item.y1)
      }
    }
  } finally {
    new SceneResources(root).dispose()
    cutaways.length = 0
  }
})
