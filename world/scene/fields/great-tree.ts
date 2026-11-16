import * as THREE from "three"
import { hash2 } from "#/lib/engine/hash2"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { sway } from "#/world/scene/fields/sway"

const crownGeo = new THREE.IcosahedronGeometry(1, 0)
const crown = M.leaf2.clone()

const grey = (k: number) => {
  const v = Math.max(0, Math.min(255, Math.round(255 * k)))
  return (v << 16) | (v << 8) | v
}

/** The crown's clumps: how far out, how high, how big, how many round. */
const RINGS: readonly (readonly [number, number, number, number])[] = [
  [3.3, 4.7, 1.25, 7],
  [2.3, 5.9, 1.6, 6],
  [1.2, 7.1, 1.6, 4],
  [0.2, 8.1, 1.3, 1],
]

/**
 * The old great tree of the deep wood (landscape.md「マップごとのテーマ」: 古い大木): a bole as wide as
 * a house, roots standing out of the ground like walls, moss to above head height, a hollow at its
 * foot, and a crown that covers the clearing it has made for itself.
 */
export function greatTree(root: THREE.Group, x: number, z: number) {
  const y = groundH(x, z)
  piece({
    root: root,
    at: [x, y, z],
    build: (gb) => {
      gb.cyl({ side: M.woodDark, top: null, centerX: 0, centerZ: 0, fromY: -0.5, toY: 2.4, fromRadius: 1.3, toRadius: 0.98, segments: 11, repeat: 2 })
      gb.cyl({ side: M.woodDark, top: M.woodDark, centerX: 0, centerZ: 0, fromY: 2.4, toY: 5.6, fromRadius: 0.98, toRadius: 0.66, segments: 11, repeat: 2 })
      gb.cyl({ side: ruinMats.moss, top: null, centerX: 0, centerZ: 0, fromY: -0.5, toY: 1.0, fromRadius: 1.4, toRadius: 1.22, segments: 11, repeat: 2 })
      // the hollow, on the side the path comes from
      gb.box({ side: M.dark, top: M.dark, x0: -0.34, y0: 0, z0: 1.05, x1: 0.34, y1: 1.15, z1: 1.36, repeat: 1 })
    },
  })
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.4
    const len = 1.5 + hash2(k, 3, 91) * 1.1
    // a root: high where it leaves the bole, running out and down into the ground
    piece({
      root: root,
      at: [x + Math.cos(a) * 1.05, y + 0.95, z + Math.sin(a) * 1.05],
      turn: [0, -a, -0.48],
      build: (gb) => gb.box({ side: M.woodDark, top: k % 2 ? ruinMats.moss : M.woodDark, x0: 0, y0: -0.5, z0: -0.2, x1: len, y1: 0.12, z1: 0.2, repeat: 2 }),
    })
    // a limb: out and up into the crown
    if (k < 5)
      piece({
        root: root,
        at: [x + Math.cos(a + 0.5) * 0.6, y + 4.3 + (k % 2) * 0.6, z + Math.sin(a + 0.5) * 0.6],
        turn: [0, -(a + 0.5), 0.45],
        build: (gb) => gb.box({ side: M.woodDark, top: M.woodDark, x0: 0, y0: -0.16, z0: -0.16, x1: 2.6, y1: 0.16, z1: 0.16, repeat: 2, bottom: true }),
      })
  }
  const leaves = sway(crown, 0.02)
  RINGS.forEach((ring, i) => {
    const spots: Spot[] = []
    for (let k = 0; k < ring[3]; k++) {
      const a = (k / ring[3]) * Math.PI * 2 + i * 0.7
      spots.push({ x: x + Math.cos(a) * ring[0], z: z + Math.sin(a) * ring[0], s: ring[2] * (0.9 + hash2(k, i, 92) * 0.25), r: a })
    }
    instanced({
      root: root,
      geo: crownGeo,
      material: leaves,
      spots: spots,
      place: (s) => [
        [s.x, y + ring[1] + Math.sin(s.r * 3) * 0.3, s.z],
        [s.r, s.r * 2, 0],
        [s.s, s.s * 0.82, s.s],
      ],
      tint: (s) => grey(0.72 + i * 0.1 + hash2(Math.floor(s.x * 3), Math.floor(s.z * 3), 93) * 0.12),
    })
  })
  blockCircle(x, z, 1.45)
}
