import * as THREE from "three"

const crownGeo = new THREE.IcosahedronGeometry(1, 0)

import { M } from "#/world/scene/construction/materials"
import { hash2 } from "#/lib/engine/hash2"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { trunkGeo } from "#/world/scene/fields/vegetation"
import { sway } from "#/world/scene/fields/sway"

/** The crown's material for the fields, swaying, kept apart from the town's still trees. */
const CROWNS = new Map<THREE.Material, THREE.Material>()
const crownOf = (leaf: THREE.Material) => {
  const known = CROWNS.get(leaf)
  if (known) return sway(known, 0.035)
  const own = leaf.clone()
  CROWNS.set(leaf, own)
  return sway(own, 0.035)
}

/**
 * Leaf clumps of a crown: round the trunk low down, then higher and closer in, one on top. Each
 * is an offset (in the tree's size) and a size; the lower clumps are in the shade of the upper.
 */
const CLUMPS: readonly { a: number; d: number; y: number; r: number; shade: number }[] = [
  { a: 0, d: 0.42, y: 1.45, r: 0.62, shade: 0.82 },
  { a: 2.1, d: 0.44, y: 1.5, r: 0.6, shade: 0.86 },
  { a: 4.2, d: 0.4, y: 1.42, r: 0.64, shade: 0.8 },
  { a: 1.0, d: 0.26, y: 1.85, r: 0.62, shade: 0.97 },
  { a: 3.3, d: 0.28, y: 1.9, r: 0.58, shade: 1 },
  { a: 5.4, d: 0.22, y: 1.8, r: 0.56, shade: 0.94 },
  { a: 0.5, d: 0.05, y: 2.2, r: 0.5, shade: 1.08 },
]

const grey = (k: number) => {
  const v = Math.max(0, Math.min(255, Math.round(255 * k)))
  return (v << 16) | (v << 8) | v
}

export function broadleaves(root: THREE.Group, spots: Spot[], leaf: THREE.Material = M.leaf2) {
  instanced({
    root: root,
    geo: trunkGeo,
    material: M.woodDark,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s * 1.2, s.s * 1.5, s.s * 1.2],
    ],
  })
  const crown = crownOf(leaf)
  CLUMPS.forEach((c, k) => {
    instanced({
      root: root,
      geo: crownGeo,
      material: crown,
      spots: spots,
      place: (s) => {
        const a = s.r + c.a
        return [
          [s.x + Math.cos(a) * c.d * s.s, groundH(s.x, s.z) + c.y * s.s, s.z + Math.sin(a) * c.d * s.s],
          [a, a * 2 + k, 0],
          [c.r * s.s, c.r * 0.86 * s.s, c.r * s.s],
        ]
      },
      // each tree a little lighter or darker than its neighbours, the lower clumps in shade
      tint: (s) => grey(c.shade * (0.9 + hash2(Math.floor(s.x * 5), Math.floor(s.z * 5), 17) * 0.2)),
    })
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.32 * s.s)
}
