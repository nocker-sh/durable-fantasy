import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"
import { tuftGeo } from "#/world/scene/fields/tufts"
import { sway } from "#/world/scene/fields/sway"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

/** A clump of green blades, dark at the foot and catching the light at the tips, some bent over. */
function bladeMaterial(ramp: string, seed: number) {
  const b = new PixBuf(24, 24)
  const r = new Rng(seed)
  const n = RAMPS[ramp].length
  for (let k = 0; k < 30; k++) {
    const x0 = 4 + r.int(16),
      h = 9 + r.int(14),
      lean = (r.next() - 0.5) * 2,
      bow = 1 + r.next() * 4
    for (let t = 0; t < h; t++) {
      const x = Math.round(x0 + (t / h) ** 2 * bow * lean)
      const level = Math.min(n - 1, 2 + Math.floor((t / h) * (n - 2.2)) + (r.next() < 0.15 ? 1 : 0))
      b.set({ x: Math.min(23, Math.max(0, x)), y: 23 - t, color: RAMPS[ramp][Math.max(0, level)] })
    }
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
}

const GREEN = bladeMaterial("grass", 501)
const WILD = bladeMaterial("wild", 502)

/**
 * Green grass standing in clumps, bending in the wind. It is drawn only: it does not block the
 * way, so it can grow right up to the verges and round the feet of stones and trees.
 */
export function grassClumps(root: THREE.Group, spots: Spot[], wild = false) {
  instanced({
    root: root,
    geo: tuftGeo,
    material: sway(wild ? WILD : GREEN, 0.07),
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s * 1.1, s.s * 1.25, s.s * 1.1],
    ],
    shadow: false,
  })
}
