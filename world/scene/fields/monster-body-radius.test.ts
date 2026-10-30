import { expect, it } from "vitest"
import * as THREE from "three"
import { createMonsterBody } from "#/world/scene/create-monster-body"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"
import { SLIME_MOVING_SQUASH, SLIME_RESTING_SQUASH } from "#/world/core/monster-body-shapes"
it.each(Object.entries(MONSTER_KINDS))("bounds every rendered vertex of %s through its squash phases", (_name, kind) => {
  const radius = getMonsterBodyRadius({ kind })
  if (radius instanceof Error) throw radius
  const body = createMonsterBody(kind)
  for (const squash of [1, 1 - SLIME_MOVING_SQUASH, 1 + SLIME_MOVING_SQUASH, 1 - SLIME_RESTING_SQUASH, 1 + SLIME_RESTING_SQUASH]) {
    const size = kind.size ?? 1
    body.scale.setScalar(size)
    if (kind.look === "slime") body.scale.set(size / Math.sqrt(squash), size * squash, size / Math.sqrt(squash))
    body.rotation.y = 0.37
    body.updateMatrixWorld(true)
    body.traverse((part) => {
      if (!(part instanceof THREE.Mesh)) return
      const vertices = part.geometry.getAttribute("position")
      for (const index of Array.from({ length: vertices.count }).keys()) {
        const vertex = new THREE.Vector3().fromBufferAttribute(vertices, index).applyMatrix4(part.matrixWorld)
        expect(Math.hypot(vertex.x, vertex.z)).toBeLessThanOrEqual(radius)
      }
    })
  }
})
it("rejects nonphysical body scales", () => {
  for (const size of [0, -1, NaN]) expect(getMonsterBodyRadius({ kind: { look: "slime", size } })).toEqual(new Error("Invalid monster body size"))
})
