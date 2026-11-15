import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { Rng } from "#/lib/engine/random"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import { drum } from "#/world/scene/fields/drum"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

const floatGeo = new THREE.SphereGeometry(0.15, 7, 5)
const coilGeo = new THREE.TorusGeometry(0.28, 0.07, 5, 10).rotateX(Math.PI / 2)
const paints = [0xb8483c, 0x3c7c74, 0xe8dcc0, 0x2c4a7c].map((c) => colorMat(c))

/**
 * The net-sheds' floats heaped by the wall, painted so each boat knows its own, with a coil of
 * line and a stack of pots for the crabs beside them. In use: the heap changes with the season.
 */
export function fishingFloats(root: THREE.Group, at: readonly [number, number], seed: number) {
  const r = new Rng(seed)
  const y = groundH(at[0], at[1])
  const heap: Spot[] = []
  for (let k = 0; k < 13; k++) {
    const a = r.next() * Math.PI * 2,
      d = r.next() * (k < 9 ? 0.5 : 0.2)
    heap.push({ x: at[0] + Math.cos(a) * d, z: at[1] + Math.sin(a) * d, s: 0.85 + r.next() * 0.35, r: k < 9 ? 0.13 : 0.34 })
  }
  paints.forEach((paint, i) =>
    instanced({
      root: root,
      geo: floatGeo,
      material: paint,
      spots: heap.filter((_, k) => k % paints.length === i),
      place: (s) => [
        [s.x, y + s.r, s.z],
        [0, 0, 0],
        [s.s, s.s, s.s],
      ],
    }),
  )
  const coil = new THREE.Mesh(coilGeo, M.rope)
  coil.position.set(at[0] + 0.75, y + 0.07, at[1] + 0.25)
  coil.castShadow = true
  root.add(coil)
  // pots for the crabs: three in a row and one on top
  for (const p of [
    [-0.8, -0.2, 0.2],
    [-0.85, 0.45, 0.2],
    [-0.8, 0.12, 0.58],
  ]) {
    drum({ root: root, at: [at[0] + p[0], y + p[2], at[1] + p[1]], turn: [Math.PI / 2, 0.2, 0], radius: 0.24, length: 0.5, material: M.woodDark, segments: 8 })
    drum({ root: root, at: [at[0] + p[0], y + p[2], at[1] + p[1]], turn: [Math.PI / 2, 0.2, 0], radius: 0.26, length: 0.08, material: M.rope, segments: 8 })
  }
  blockCircle(at[0], at[1], 0.55)
  blockCircle(at[0] - 0.8, at[1] + 0.12, 0.45)
}
