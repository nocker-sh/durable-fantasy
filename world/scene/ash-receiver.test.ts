import { expect, it } from "vitest"
import * as THREE from "three"
import { INTERIORS } from "#/world/town/interiors"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { cutaways } from "#/world/scene/interior"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { M } from "#/world/scene/construction/materials"
import { SceneResources } from "#/lib/graphics/scene-resources"
it("renders the stored ash box at its authored shelf position with an iron lid and an open grip handle", () => {
  setLayout(INDOOR)
  const room = INTERIORS.find((r) => r.id === "phanthiet-in-h-m5")!,
    shelf = room.furniture.find((f) => f.shelf?.items?.some((i) => i.id === "ash-receiver"))!,
    root = new THREE.Group()
  try {
    buildInterior(room)(root)
    root.updateMatrixWorld(true)
    const floor = groundH(room.x0 + 1, room.z0 + 1) + 0.02,
      index = shelf.shelf!.items!.findIndex((i) => i.id === "ash-receiver"),
      bounds = shelfItemParts({ x: shelf.x, z: shelf.z, width: shelf.w, depth: shelf.d, floor: floor, shelf: shelf.shelf! })[index],
      ray = new THREE.Raycaster(new THREE.Vector3((bounds.x0 + bounds.x1) / 2, bounds.y1 + 0.01, (bounds.z0 + bounds.z1) / 2), new THREE.Vector3(0, -1, 0)),
      hit = ray.intersectObject(root.getObjectByName("interior-furniture")!, true)[0]
    expect(hit?.point.y).toBeCloseTo(bounds.y1)
    const item = shelf.shelf!.items![index],
      lidTop = bounds.y1 - item.lidHandle!.height,
      clearX = (bounds.x0 + bounds.x1) / 2 + (bounds.x1 - bounds.x0) / 4,
      lidRay = new THREE.Raycaster(new THREE.Vector3(clearX, bounds.y1 + 0.01, (bounds.z0 + bounds.z1) / 2), new THREE.Vector3(0, -1, 0))
    expect(lidRay.intersectObject(root.getObjectByName("interior-furniture")!, true)[0]?.point.y).toBeCloseTo(lidTop)
    const material = (hit!.object as THREE.Mesh).material,
      materials = Array.isArray(material) ? material : [material]
    expect(materials[hit!.face!.materialIndex]).toBe(M.iron)
  } finally {
    new SceneResources(root).dispose()
    cutaways.length = 0
  }
})
