import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

const petalGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)

// petals lying where they fell: single pixels and pairs, thicker towards the middle of the patch
const petalMat = (() => {
  const b = new PixBuf(32, 32)
  const r = new Rng(331)
  for (let k = 0; k < 150; k++) {
    const a = r.next() * Math.PI * 2,
      d = r.next() ** 0.8 * 15
    const x = Math.round(15.5 + Math.cos(a) * d),
      y = Math.round(15.5 + Math.sin(a) * d)
    b.set({ x: x, y: y, color: RAMPS.blossom[2 + r.int(3)] })
    if (r.next() < 0.35) b.set({ x: Math.min(31, x + 1), y: y, color: RAMPS.blossom[3] })
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

/** The petals a tree in flower has let fall, lying on the grass round its foot. Drawn only. */
export function fallenPetals(root: THREE.Group, x: number, z: number) {
  const r = new Rng(Math.round(x * 31 + z * 17))
  const spots: Spot[] = []
  for (let k = 0; k < 16; k++) {
    const a = r.next() * Math.PI * 2,
      d = 0.3 + r.next() * 2.6
    spots.push({ x: x + Math.cos(a) * d, z: z + Math.sin(a) * d, s: 1.1 + r.next() * 0.9, r: r.next() * Math.PI * 2 })
  }
  instanced({
    root: root,
    geo: petalGeo,
    material: petalMat,
    spots: spots,
    place: (s) => [
      [s.x, groundH(s.x, s.z) + 0.03, s.z],
      [0, s.r, 0],
      [s.s, 1, s.s],
    ],
    shadow: false,
  })
}
