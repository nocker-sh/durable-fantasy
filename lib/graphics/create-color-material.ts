import * as THREE from "three"
export function createColorMaterial(c: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color: c })
}
