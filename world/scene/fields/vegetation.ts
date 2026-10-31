import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import * as THREE from "three"

export const trunkGeo = new THREE.CylinderGeometry(0.08, 0.13, 1, 6).translate(0, 0.5, 0)

export const rockGeo = new THREE.DodecahedronGeometry(0.5, 0)

export const stemGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.1, 5).translate(0, 0.05, 0)

export const flowerMats = [0xe8e4d8, 0xe0cc6a, 0xa890c0, 0x8aa0c8].map((c, k) => {
  const b = new PixBuf(24, 18)
  const r = new Rng(91 + k)
  for (let t = 0; t < 9; t++) {
    const x0 = 2 + r.int(20),
      h = 5 + r.int(9)
    for (let y = 0; y < h; y++)
      b.set({
        x: x0,
        y: 17 - y,
        color: RAMPS.moss[2 + (y % 2)],
      })
    const head = hex(`#${c.toString(16).padStart(6, "0")}`)
    for (const [dx, dy] of [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
    ])
      b.set({
        x: Math.min(23, Math.max(0, x0 + dx)),
        y: 17 - h + dy,
        color: head,
      })
  }
  return mat(b, {
    alpha: true,
    side: THREE.DoubleSide,
  })
})

export const reedMat = (() => {
  const b = new PixBuf(24, 32)
  const r = new Rng(97)
  for (let k = 0; k < 14; k++) {
    const x0 = 1 + r.int(22),
      h = 18 + r.int(13),
      lean = r.next() < 0.5 ? -1 : 1
    for (let t = 0; t < h; t++)
      b.set({
        x: Math.min(23, Math.max(0, x0 + Math.round((t / h) ** 3 * 2 * lean))),
        y: 31 - t,
        color: t > h - 5 && k % 3 === 0 ? RAMPS.wood[2] : RAMPS.moss[1 + Math.min(3, Math.floor((t / h) * 3))],
      })
  }
  return mat(b, {
    alpha: true,
    side: THREE.DoubleSide,
  })
})()
