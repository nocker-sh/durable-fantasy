import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { WATER_Y } from "#/world/maps/ground/rules"
import { tuftGeo } from "#/world/scene/fields/tufts"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

const padGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)

// a round leaf with a notch cut to its middle, veins running out from the stem
const padMat = (() => {
  const b = new PixBuf(16, 16)
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const dx = x - 7.5,
        dy = y - 7.5,
        d = Math.hypot(dx, dy)
      if (d > 7.6) continue
      const a = Math.atan2(dy, dx)
      if (d > 0.8 && a > -0.32 && a < 0.32) continue // the notch
      const vein = Math.abs(((a / Math.PI) * 6 + 12) % 1 - 0.5) < 0.08 && d > 2
      const lvl = d > 6.6 ? 1 : vein ? 4 : 2 + ((x * 7 + y * 3) % 5 === 0 ? 1 : 0)
      b.set({ x, y, color: RAMPS.leaf[lvl] })
    }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

// the flower: a cup of pale petals, opening on the pad
const flowerMat = (() => {
  const b = new PixBuf(12, 9)
  const rows = ["....a..a....", "..a.ab.ba.a.", "..abbcbcbba.", ".abbcccccbba", ".abcccdcccba", "..abccdccba.", "...abbbbba..", "....aaaa....", "............"]
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === ".") return
      const c = ch === "a" ? RAMPS.cRose[3] : ch === "b" ? RAMPS.frost[3] : ch === "c" ? RAMPS.frost[5] : RAMPS.gold[3]
      b.set({ x, y, color: c })
    }),
  )
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

/** Pads floating on the still water; a few of them (every fifth) carry a flower. */
export function lilyPads(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: padGeo,
    material: padMat,
    spots: spots,
    place: (s) => [
      [s.x, WATER_Y + 0.012 + (s.r % 0.01), s.z],
      [0, s.r, 0],
      [s.s, 1, s.s],
    ],
  })
  instanced({
    root: root,
    geo: tuftGeo,
    material: flowerMat,
    spots: spots.filter((_, i) => i % 5 === 0),
    place: (s) => [
      [s.x + 0.1 * s.s, WATER_Y + 0.0, s.z],
      [0, s.r, 0],
      [s.s * 0.45, s.s * 0.5, s.s * 0.45],
    ],
  })
}
