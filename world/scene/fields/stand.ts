import * as THREE from "three"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"

/**
 * Where a thing built about its own origin stands in the world: its group, set on the ground at
 * (x, z) and turned by `rot`, and a way to block the walk grid at a point given in the thing's own
 * coordinates.
 */
export function stand(root: THREE.Group, at: readonly [number, number], rot: number) {
  const group = new THREE.Group()
  group.position.set(at[0], groundH(at[0], at[1]), at[1])
  group.rotation.y = rot
  root.add(group)
  const c = Math.cos(rot),
    s = Math.sin(rot)
  return {
    group: group,
    block: (lx: number, lz: number, r: number) => blockCircle(at[0] + lx * c + lz * s, at[1] - lx * s + lz * c, r),
  }
}
