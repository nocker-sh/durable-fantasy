import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { hash2 } from "#/lib/engine/hash2"
import { RAMPS } from "#/world/scene/pix"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { sway } from "#/world/scene/fields/sway"

// pale bark with dark scars running across it
const barkMat = (() => {
  const b = new PixBuf(16, 32)
  b.fill((x, y) => RAMPS.birch[hash2(x, y, 211) > 0.8 ? 3 : 4])
  for (let k = 0; k < 16; k++) {
    const y = Math.floor(hash2(k, 1, 212) * 32),
      x0 = Math.floor(hash2(k, 2, 212) * 16),
      len = 2 + Math.floor(hash2(k, 3, 212) * 5)
    for (let i = 0; i < len; i++) b.set({ x: (x0 + i) % 16, y: y, color: RAMPS.blackOak[1 + (i % 2)] })
  }
  return mat(b)
})()

const trunkGeo = new THREE.CylinderGeometry(0.045, 0.085, 1, 6).translate(0, 0.5, 0)
const crownGeo = new THREE.IcosahedronGeometry(1, 0)

const goldCrown = M.gold.clone()
const greenCrown = M.leaf.clone()

/** A light, airy crown: small clumps high on the slender trunk. Offset, height and size, in the tree's size. */
const CLUMPS: readonly { a: number; d: number; y: number; r: number; shade: number }[] = [
  { a: 0.3, d: 0.3, y: 1.75, r: 0.4, shade: 0.84 },
  { a: 2.5, d: 0.32, y: 1.9, r: 0.38, shade: 0.88 },
  { a: 4.4, d: 0.28, y: 2.05, r: 0.4, shade: 0.94 },
  { a: 1.4, d: 0.16, y: 2.4, r: 0.38, shade: 1 },
  { a: 3.6, d: 0.1, y: 2.75, r: 0.3, shade: 1.08 },
]

const grey = (k: number) => {
  const v = Math.max(0, Math.min(255, Math.round(255 * k)))
  return (v << 16) | (v << 8) | v
}

/** Birches: white trunks and small bright leaves, gold where the cold has turned them. */
export function birches(root: THREE.Group, spots: Spot[], golden = true) {
  instanced({
    root: root,
    geo: trunkGeo,
    material: barkMat,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0.04 * Math.sin(s.r * 3), s.r, 0.05 * Math.cos(s.r * 5)],
      [s.s, s.s * 2.6, s.s],
    ],
  })
  const crown = sway(golden ? goldCrown : greenCrown, 0.04)
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
          [c.r * s.s, c.r * 0.9 * s.s, c.r * s.s],
        ]
      },
      tint: (s) => grey(c.shade * (0.9 + hash2(Math.floor(s.x * 5), Math.floor(s.z * 5), 23) * 0.2)),
    })
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.22 * s.s)
}
