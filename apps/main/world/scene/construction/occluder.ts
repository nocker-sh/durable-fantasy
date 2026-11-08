import * as THREE from "three"
import { glowMats, houseGlows, houseShutters, occluders } from "#/world/scene/construction/registry"

/**
 * Something that may stand between the camera and the player. Trees and the buildings you can go
 * into fade; a house you cannot enter stays solid (nothing inside is shown) and the player is drawn
 * through it as a silhouette instead (`opaque`).
 */
export function occluder(obj: THREE.Object3D, min = 0.22, opaque = false) {
  // one copy per material, shared by every mesh of this object that had it: the fade is per
  // object, and meshes that share a material can be merged into one draw (lib/graphics/merge-static.ts)
  const copies = new Map<THREE.Material, THREE.MeshLambertMaterial>()
  obj.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const was = m.material as THREE.MeshLambertMaterial
    const copy = { value: copies.get(was) }
    if (!copy.value) {
      copies.set(was, (copy.value = was.clone()))
      // a glowing window is lit through its copy from now on
      for (const g of houseGlows) if (g.mat === was) g.mat = copy.value
      for (const s of houseShutters) if (s.mat === was) s.mat = copy.value
      const k = glowMats.indexOf(was)
      if (k >= 0) glowMats[k] = copy.value
    }
    m.material = copy.value
  })
  occluders.push({ obj, box: new THREE.Box3().setFromObject(obj), fade: 1, min, opaque })
}
