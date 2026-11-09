import * as THREE from "three"
import { dust } from "#/world/scene/dust"

/** Dust everything built in a scene, except what `skip` says (the ground, which is painted with its own ash). */
export function dustAll(root: THREE.Object3D, skip: (o: THREE.Object3D) => boolean) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh || skip(o)) return
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) if (!m.transparent) dust(m)
  })
}
