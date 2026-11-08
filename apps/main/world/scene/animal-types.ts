import type * as THREE from "three"

export type Critter = {
  update(dt: number, camRight: THREE.Vector3): void
  outline(on: boolean): void
  readonly obj: THREE.Object3D
}
