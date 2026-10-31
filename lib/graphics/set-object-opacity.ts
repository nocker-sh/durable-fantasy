import { Material } from "three"
import type { Object3D } from "three"

/** Apply one fade to every material owned by a rendered object. */
export function setObjectOpacity(object: Object3D, opacity: number): void {
  object.traverse((child) => {
    if (!("material" in child)) return
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) {
      if (!(material instanceof Material)) continue
      material.transparent = opacity < 1
      material.opacity = opacity
      material.depthWrite = opacity >= 1
    }
  })
}
