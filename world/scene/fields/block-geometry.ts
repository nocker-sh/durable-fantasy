import * as THREE from "three"
import type { FigureShape } from "#/world/core/monster-figure-types"

/** The geometry of one block. A ball is a unit sphere, to be scaled to its radii by the mesh. */
export function blockGeometry(shape: FigureShape, size: readonly [number, number, number]): THREE.BufferGeometry {
  if (shape === "box") return new THREE.BoxGeometry(size[0], size[1], size[2])
  if (shape === "ball") return new THREE.SphereGeometry(1, 8, 6)
  if (shape === "cone") return new THREE.ConeGeometry(size[0], size[1], Math.max(3, Math.round(size[2]) || 6))
  return new THREE.CylinderGeometry(size[0], size[2], size[1], 6)
}
