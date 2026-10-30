import { expect, it } from "vitest"
import * as THREE from "three"
import { INTERIORS } from "#/world/town/interiors"
import { rectangleFace } from "#/lib/engine/rectangle-face"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { cutaways } from "#/world/scene/interior"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { M } from "#/world/scene/construction/materials"
import { SceneResources } from "#/lib/graphics/scene-resources"
it("faces the hearth mouth and firelight toward each authored operating side", () => {
  for (const front of ["n", "s", "w", "e"] as const) {
    setLayout(INDOOR)
    const original = INTERIORS.find((room) => room.id === "phanthiet-in-h-m5")!,
      piece = original.furniture.find((f) => f.kind === "hearth")!
    const source = original.flues![0],
      sx = (source.x1 - source.x0) / 2,
      sz = (source.z1 - source.z0) / 2
    const room = { ...original, flues: [{ ...source, x0: piece.x - sx, x1: piece.x + sx, z0: piece.z - sz, z1: piece.z + sz }], furniture: [{ ...piece, hearthFront: front }] },
      root = new THREE.Group()
    try {
      buildInterior(room)(root)
      root.updateMatrixWorld(true)
      const floor = groundH(room.x0 + 1, room.z0 + 1) + 0.02,
        face = rectangleFace({ x: piece.x, z: piece.z, width: piece.w, depth: piece.d, side: front }),
        [nx, nz] = face.outward
      const masonry = root.getObjectByName("hearth")!,
        ray = new THREE.Raycaster(new THREE.Vector3(face.point[0] + nx, floor + 0.5, face.point[1] + nz), new THREE.Vector3(-nx, 0, -nz))
      const hit = ray.intersectObject(masonry, true)[0]
      if (!hit) throw new Error(`No hearth mouth hit from ${front}`)
      expect((hit.object as THREE.Mesh).material, front).toBe(M.stoneDark)
      expect(hit.distance).toBeCloseTo(1 + piece.hearth!.chamberDepth, 6)
      const light = root.getObjectByName("hearth-light")!
      expect(light.position.x).toBeCloseTo(face.point[0] + nx * 0.5)
      expect(light.position.z).toBeCloseTo(face.point[1] + nz * 0.5)
      const bounds = new THREE.Box3().setFromObject(masonry)
      expect(bounds.min.x).toBeGreaterThanOrEqual(piece.x - piece.w / 2 - 0.020001)
      expect(bounds.max.x).toBeLessThanOrEqual(piece.x + piece.w / 2 + 0.020001)
      expect(bounds.min.z).toBeGreaterThanOrEqual(piece.z - piece.d / 2 - 0.020001)
      expect(bounds.max.z).toBeLessThanOrEqual(piece.z + piece.d / 2 + 0.020001)
    } finally {
      new SceneResources(root).dispose()
      cutaways.length = 0
    }
  }
})
