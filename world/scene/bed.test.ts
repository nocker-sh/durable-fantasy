import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import * as THREE from "three"
import { readSetting } from "#/scripts/lib/read-setting"
import { bedDimensions } from "#/scripts/lib/bed-dimensions"
import { scaleBed } from "#/world/town/scale-bed"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { cutaways } from "#/world/scene/interior"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { SceneResources } from "#/lib/graphics/scene-resources"
it("draws a closed sleeping surface for existing and measured native beds", () => {
  const document = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h10-2.md", import.meta.url), "utf8"))
  const source = document.furniture!.find((f) => f.runtime_kind === "bed")!,
    k = ROOM_SCALE
  const spec = bedDimensions(source.bed, source.rect[2] * document.grid!.cell_m, source.rect[3] * document.grid!.cell_m)
  for (const measured of [false, true]) {
    setLayout(INDOOR)
    const room = interiorPlan(HOUSES.find((h) => h.id === "h10")!),
      root = new THREE.Group()
    room.furniture = [{ kind: "bed", solid: true, x: 16, z: 16, w: k, d: 2 * k, bed: measured ? scaleBed(spec, k) : undefined }]
    try {
      buildInterior(room)(root)
      root.updateMatrixWorld(true)
      const floor = groundH(room.x0 + 1, room.z0 + 1) + 0.02
      const ray = new THREE.Raycaster(new THREE.Vector3(16, floor + 3, 16), new THREE.Vector3(0, -1, 0))
      const hits = ray.intersectObject(root, true)
      expect(hits.length).toBeGreaterThan(0)
      expect(hits[0].point.y).toBeCloseTo(floor + (measured ? (spec.frameHeight + spec.mattressThickness) * k : 0.43))
    } finally {
      new SceneResources(root).dispose()
      cutaways.length = 0
    }
  }
})
