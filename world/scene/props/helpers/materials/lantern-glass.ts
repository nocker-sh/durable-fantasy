import * as THREE from "three"

const glass: { value: THREE.MeshLambertMaterial | null } = { value: null }

/** The glass of a lantern: it glows by night with the town's lamps (glowMats). */
export function lanternGlass() {
  glass.value ??= new THREE.MeshLambertMaterial({ color: 0xffd890, emissive: new THREE.Color(0xffb050), emissiveIntensity: 0.9 })
  return glass.value
}
