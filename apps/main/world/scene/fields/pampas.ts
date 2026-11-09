import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"
import { tuftGeo } from "#/world/scene/fields/tufts"
import { sway } from "#/world/scene/fields/sway"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

// pampas grass: a clump of tall dry stalks, each bowed over at the top under a pale, feathery plume
const pampasMat = (() => {
  const b = new PixBuf(32, 48)
  const r = new Rng(311)
  for (let k = 0; k < 13; k++) {
    const x0 = 6 + r.int(20),
      h = 26 + r.int(20),
      lean = r.next() < 0.5 ? -1 : 1,
      bow = 3 + r.int(5)
    const at = (t: number) => Math.round(x0 + (t / h) ** 2 * bow * lean)
    for (let t = 0; t < h; t++) b.set({ x: at(t), y: 47 - t, color: RAMPS.thatch[1 + Math.min(3, Math.floor((t / h) * 3.5))] })
    // the plume hangs from the stalk's tip, drooping the way it leans
    const tipX = at(h - 1),
      tipY = 47 - h
    for (let p = 0; p < 12; p++) {
      const px = tipX + Math.round(p * 0.55 * lean),
        py = tipY + Math.round((p / 12) ** 2 * 6)
      const wide = p < 3 ? 1 : 2
      for (let dx = -wide; dx <= wide; dx++)
        if (r.next() < 0.9 - Math.abs(dx) * 0.25) b.set({ x: px + dx, y: py + Math.abs(dx), color: r.next() < 0.25 ? RAMPS.sand[5] : RAMPS.frost[4 + (r.next() < 0.5 ? 1 : 0)] })
    }
  }
  // a skirt of leaves at the foot
  for (let k = 0; k < 18; k++) {
    const x0 = 6 + r.int(20),
      h = 6 + r.int(9),
      lean = r.next() < 0.5 ? -1 : 1
    for (let t = 0; t < h; t++) b.set({ x: x0 + Math.round((t / h) ** 2 * 5 * lean), y: 47 - t, color: RAMPS.wild[1 + Math.min(3, Math.floor((t / h) * 3))] })
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

export function pampas(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: tuftGeo,
    material: sway(pampasMat, 0.05),
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s * 2.4, s.s * 5, s.s * 2.4],
    ],
  })
}
