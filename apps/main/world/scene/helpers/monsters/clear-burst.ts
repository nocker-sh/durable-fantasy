import type * as THREE from "three"
import type { MonsterView } from "#/world/scene/monsters"

/** Burst meshes own their geometry and materials, but borrow the shared slime texture. */
export function clearBurst(m: MonsterView) {
  const effect = m.burst
  m.burst = null
  if (!effect) return
  for (const bit of effect.bits) {
    bit.removeFromParent()
    bit.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) material.dispose()
    })
  }
}
