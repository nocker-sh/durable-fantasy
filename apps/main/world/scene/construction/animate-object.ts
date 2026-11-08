import * as THREE from "three"
import { updaters, movingObjects } from "#/world/scene/construction/registry"

export function animateObject(object: THREE.Object3D, update: (t: number, dt: number) => void) {
  movingObjects.add(object)
  updaters.push(update)
}
