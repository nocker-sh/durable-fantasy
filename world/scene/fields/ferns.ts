import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { hash2 } from "#/lib/engine/hash2"
import { RAMPS } from "#/world/scene/pix"
import { sway } from "#/world/scene/fields/sway"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

/** A fern seen from the side: fronds rising from the root and arching out, leaflets along each. */
const fernMat = (() => {
  const b = new PixBuf(32, 24)
  const r = new Rng(611)
  for (let k = 0; k < 7; k++) {
    const side = k % 2 ? 1 : -1,
      reach = 6 + r.int(9),
      rise = 8 + r.int(10)
    for (let t = 0; t <= 20; t++) {
      const f = t / 20
      const x = 16 + Math.round(side * reach * f + (r.next() - 0.5) * 0.6),
        y = 23 - Math.round(rise * Math.sin(f * Math.PI * 0.8))
      b.set({ x, y, color: RAMPS.moss[3] })
      // leaflets down both sides of the stem, smaller towards the tip
      const len = Math.round((1 - f) * 3)
      for (let l = 1; l <= len; l++) {
        b.set({ x, y: y - l, color: RAMPS.moss[4 + (l === 1 ? 1 : 0)] })
        b.set({ x, y: y + l, color: RAMPS.moss[3 + (l === 1 ? 1 : 0)] })
      }
    }
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

const fernGeo = (() => {
  const a = new THREE.PlaneGeometry(1, 0.75).translate(0, 0.33, 0)
  const parts = [a, a.clone().rotateY(Math.PI / 3), a.clone().rotateY((2 * Math.PI) / 3)].map((g) => g.toNonIndexed())
  const g = new THREE.BufferGeometry()
  for (const name of ["position", "uv", "normal"]) {
    const arrays = parts.map((p) => Array.from(p.attributes[name].array))
    g.setAttribute(name, new THREE.Float32BufferAttribute(arrays.flat(), name === "uv" ? 2 : 3))
  }
  return g
})()

const grey = (k: number) => {
  const v = Math.max(0, Math.min(255, Math.round(255 * k)))
  return (v << 16) | (v << 8) | v
}

/** Ferns on the damp, shaded floor of the woods and by the falls; drawn only, they block nothing. */
export function ferns(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: fernGeo,
    material: sway(fernMat, 0.06),
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s, s.s],
    ],
    tint: (s) => grey(0.85 + hash2(Math.floor(s.x * 4), Math.floor(s.z * 4), 29) * 0.3),
    shadow: false,
  })
}
