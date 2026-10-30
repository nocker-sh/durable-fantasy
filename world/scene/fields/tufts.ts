import * as THREE from "three"

import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"

const tuftGeo = (() => {
  const a = new THREE.PlaneGeometry(0.6, 0.45).translate(0, 0.2, 0)
  const b = a.clone().rotateY(Math.PI / 2)
  const g = new THREE.BufferGeometry()
  const merge = (gs: THREE.BufferGeometry[]) => {
    const pos: number[] = [],
      uv: number[] = [],
      nor: number[] = []
    for (const x of gs) {
      const n = x.toNonIndexed()
      pos.push(...n.attributes.position.array)
      uv.push(...n.attributes.uv.array)
      nor.push(...n.attributes.normal.array)
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3))
  }
  merge([a, b])
  return g
})()

const tuftMat = (() => {
  const b = new PixBuf(24, 18)
  const r = new Rng(77)
  for (const k = { value: 0 }; k.value < 16; k.value++) {
    const x0 = 3 + r.int(18),
      lean = r.next() < 0.5 ? -1 : 1,
      h = 8 + r.int(9)
    for (const t = { value: 0 }; t.value < h; t.value++)
      b.set({ x: Math.min(23, Math.max(0, x0 + Math.round((t.value / h) ** 2 * 3 * lean))), y: 17 - t.value, color: RAMPS.thatch[1 + Math.min(4, Math.floor((t.value / h) * 4) + r.int(2))] })
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

export function tufts(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: tuftGeo,
    material: tuftMat,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s, s.s],
    ],
  })
}
