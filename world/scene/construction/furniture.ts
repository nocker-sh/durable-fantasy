import * as THREE from "three"
import { GB, toTex } from "../gfx"
import { PixBuf, RAMPS, hash2, bayer } from "../pix"
import { groundH, blockRect, blockCircle } from "../world"
import { M } from "./materials.ts"
import { updaters } from "./registry.ts"

/**
 * A barrel, never quite like the one beside it (from where it stands): taller or squatter, staves
 * new or weathered dark, two or three iron hoops or rope ones, a lid on, off (dark inside) or
 * weighted with a stone.
 */
export function barrel(gb: GB, x: number, z: number, h = 0.7, r = 0.28, y?: number) {
  const y0 = y ?? groundH(x, z)
  const v = hash2(Math.round(x * 10), Math.round(z * 10), 31),
    w = hash2(Math.round(x * 10), Math.round(z * 10), 32)
  h *= 0.88 + v * 0.24
  const staves = w > 0.6 ? M.woodDark : M.woodV
  const lid = v > 0.8 ? M.dark : M.wood
  gb.cyl(staves, lid, x, z, y0, y0 + h * 0.5, r * 0.88, r, 10, 2)
  gb.cyl(staves, lid, x, z, y0 + h * 0.5, y0 + h, r, r * 0.88, 10, 2)
  const hoops = w < 0.25 ? [0.15, 0.85] : [0.12, 0.5, 0.88]
  const band = w > 0.88 ? M.rope : M.iron
  for (const hh of hoops) {
    const rr = hh === 0.5 ? r + 0.01 : r * 0.9 + 0.01
    gb.cyl(band, null, x, z, y0 + h * hh - 0.025, y0 + h * hh + 0.025, rr, rr, 10, 1)
  }
  if (v < 0.15) gb.box(M.stoneDark, M.stone, x - 0.08, y0 + h, z - 0.07, x + 0.09, y0 + h + 0.1, z + 0.08, 2) // a stone on the lid
  blockCircle(x, z, r + 0.05)
}

/**
 * A crate, each its own: a little bigger or smaller, slats across its sides, new wood or old, the
 * lid on or gone (dark inside), now and then a corner broken in.
 */
export function crate(gb: GB, x: number, z: number, s = 0.5, y?: number, rot = 0) {
  const y0 = y ?? groundH(x, z)
  const v = hash2(Math.round(x * 10), Math.round(z * 10), 41),
    w = hash2(Math.round(x * 10), Math.round(z * 10), 42)
  s *= 0.9 + v * 0.2
  const hgt = s * (0.7 + w * 0.2)
  const side = w > 0.55 ? M.woodDark : M.wood
  gb.box(side, v > 0.75 ? M.dark : M.wood, x - s / 2, y0, z - s / 2, x + s / 2, y0 + hgt, z + s / 2, 2)
  // slats across the sides
  for (const t of [0.25, 0.75]) gb.box(M.woodV, null, x - s / 2 - 0.012, y0 + hgt * t - 0.025, z - s / 2 - 0.012, x + s / 2 + 0.012, y0 + hgt * t + 0.025, z + s / 2 + 0.012, 2)
  if (w < 0.12) gb.box(M.dark, null, x + s / 2 - 0.13, y0 + hgt - 0.12, z + s / 2 - 0.01, x + s / 2 + 0.005, y0 + hgt + 0.005, z + s / 2 + 0.005, 2) // a broken corner
  void rot
  blockCircle(x, z, s * 0.6)
  return y0 + hgt
}

export function sack(gb: GB, x: number, z: number, y?: number) {
  const y0 = y ?? groundH(x, z)
  gb.cyl(M.sack, M.sack, x, z, y0, y0 + 0.35, 0.2, 0.22, 7, 2)
  gb.cyl(M.sack, M.sack, x, z, y0 + 0.35, y0 + 0.5, 0.22, 0.08, 7, 2)
  gb.cyl(M.rope, null, x, z, y0 + 0.45, y0 + 0.5, 0.1, 0.1, 6, 1)
}

export function woodpile(gb: GB, x: number, z: number, len = 1.6, layers = 4, alongX = true) {
  const y0 = groundH(x, z)
  for (let l = 0; l < layers; l++)
    for (let k = 0; k < 6 - l; k++) {
      const off = (k - (5 - l) / 2) * 0.2
      const cx = alongX ? x : x + off,
        cz = alongX ? z + off : z
      const yy = y0 + 0.1 + l * 0.17
      const g = new THREE.CylinderGeometry(0.09, 0.09, len, 6)
      void g
      if (alongX) gb.box(M.woodV, M.woodDark, cx - len / 2, yy - 0.09, cz - 0.09, cx + len / 2, yy + 0.08, cz + 0.08, 2)
      else gb.box(M.woodV, M.woodDark, cx - 0.09, yy - 0.09, cz - len / 2, cx + 0.08, yy + 0.08, cz + len / 2, 2)
    }
  if (alongX) blockRect(x - len / 2, z - 0.6, x + len / 2, z + 0.6)
  else blockRect(x - 0.6, z - len / 2, x + 0.6, z + len / 2)
}

export function table(gb: GB, x: number, z: number, w = 1.2, d = 0.6, h = 0.62) {
  const y0 = groundH(x, z)
  gb.box(M.wood, M.wood, x - w / 2, y0 + h - 0.06, z - d / 2, x + w / 2, y0 + h, z + d / 2, 2)
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      gb.box(M.woodDark, null, x + sx * (w / 2 - 0.08) - 0.04, y0 - 0.1, z + sz * (d / 2 - 0.08) - 0.04, x + sx * (w / 2 - 0.08) + 0.04, y0 + h - 0.06, z + sz * (d / 2 - 0.08) + 0.04, 2)
  blockRect(x - w / 2, z - d / 2, x + w / 2, z + d / 2)
  return y0 + h
}

export function bench(gb: GB, x: number, z: number, w = 1.2, alongX = true) {
  const y0 = groundH(x, z)
  const hw = alongX ? w / 2 : 0.18,
    hd = alongX ? 0.18 : w / 2
  gb.box(M.wood, M.wood, x - hw, y0 + 0.36, z - hd, x + hw, y0 + 0.42, z + hd, 2)
  for (const s of [-1, 1]) {
    const lx = alongX ? x + s * (hw - 0.1) : x,
      lz = alongX ? z : z + s * (hd - 0.1)
    gb.box(M.woodDark, null, lx - 0.05, y0 - 0.1, lz - 0.05, lx + 0.05, y0 + 0.36, lz + 0.05, 2)
  }
  blockRect(x - hw, z - hd, x + hw, z + hd)
}

export function bucket(gb: GB, x: number, z: number, y?: number, water = true) {
  const y0 = y ?? groundH(x, z)
  gb.cyl(M.woodV, null, x, z, y0, y0 + 0.24, 0.12, 0.15, 8, 2)
  if (water) gb.cyl(M.water, M.water, x, z, y0, y0 + 0.2, 0.01, 0.13, 8, 2)
  gb.cyl(M.iron, null, x, z, y0 + 0.18, y0 + 0.21, 0.145, 0.15, 8, 1)
}

/** The inside of a well's shaft, seen from above: laid stones, damp and mossy at the top, going to black. */
let shaftMat: THREE.MeshLambertMaterial | null = null

function wellShaftMat() {
  if (shaftMat) return shaftMat
  const W = 96,
    H = 48
  const b = new PixBuf(W, H)
  b.fill((px, py) => {
    const k = py / (H - 1) // 0 at the rim, 1 at the bottom
    if (bayer(px, py) + 0.47 < (k - 0.25) * 1.6) return [8, 6, 10]
    const row = Math.floor(py / 6),
      u = px / 10 + (row % 2) * 0.5,
      c = Math.floor(u),
      fu = u - c,
      fv = py / 6 - row
    if (fu < 0.08 || fv > 0.82) return RAMPS.stone[0]
    if (py < 10 && hash2(px >> 1, py >> 1, 4) > 0.55) return RAMPS.moss[2 + (hash2(px, py, 5) > 0.6 ? 1 : 0)]
    return RAMPS.stone[Math.max(0, 2 - Math.floor(k * 3) + (hash2(c, row, 6) > 0.7 ? 1 : 0))]
  })
  const t = toTex(b, false)
  t.wrapS = THREE.RepeatWrapping
  t.repeat.set(2, 1)
  shaftMat = new THREE.MeshLambertMaterial({ map: t, side: THREE.BackSide })
  return shaftMat
}

export function well(root: THREE.Group, x: number, z: number) {
  const gb = new GB()
  const y0 = groundH(x, z)
  gb.cyl(M.stone, null, x, z, y0 - 0.2, y0 + 0.75, 0.85, 0.85, 14, 2)
  gb.cyl(M.ashlar, null, x, z, y0 + 0.75, y0 + 0.82, 0.9, 0.9, 14, 2)
  // the mouth of the well: no water to be seen, only a hole going down — the stones of its inside
  // wall, damp and mossy near the top, fading into black
  const rim = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.9, 14, 1), M.ashlar)
  rim.rotation.x = -Math.PI / 2
  rim.position.set(x, y0 + 0.82, z)
  // (the ground is drawn inside the ring too, so the black falls away to just above it)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.74, 14, 1, true), wellShaftMat())
  shaft.position.set(x, y0 + 0.82 - 0.37, z)
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.62, 14), new THREE.MeshBasicMaterial({ color: 0x050407 }))
  bottom.rotation.x = -Math.PI / 2
  bottom.position.set(x, y0 + 0.09, z)
  root.add(rim, shaft, bottom)
  for (const s of [-1, 1]) gb.box(M.woodV, M.woodDark, x + s * 0.78 - 0.07, y0 + 0.7, z - 0.07, x + s * 0.78 + 0.07, y0 + 2.25, z + 0.07, 2)
  gb.box(M.woodDark, M.woodDark, x - 0.85, y0 + 1.45, z - 0.06, x + 0.85, y0 + 1.57, z + 0.06, 2)
  gb.box(M.rope, null, x - 0.02, y0 + 0.95, z - 0.02, x + 0.02, y0 + 1.45, z + 0.02, 2)
  // little roof
  const yR = y0 + 2.6,
    yE = y0 + 2.1
  gb.quad(M.roof2, [x - 1.1, yE, z + 0.75], [x + 1.1, yE, z + 0.75], [x + 1.1, yR, z], [x - 1.1, yR, z], 4, 4)
  gb.quad(M.roof2, [x + 1.1, yE, z - 0.75], [x - 1.1, yE, z - 0.75], [x - 1.1, yR, z], [x + 1.1, yR, z], 4, 4)
  bucket(gb, x - 0.74, z + 0.3, y0 + 0.82, true) // set down on the rim
  bucket(gb, x + 1.05, z + 0.55, undefined, true)
  root.add(gb.build())
  blockCircle(x, z, 1.05)
  // the hanging bucket on the rope bobs a little
  const b = new GB()
  bucket(b, 0, 0, 0, true)
  const hb = b.build()
  hb.position.set(x, y0 + 0.95 - 0.24, z)
  root.add(hb)
  updaters.push((t) => {
    hb.rotation.y = Math.sin(t * 0.8) * 0.3
  })
}
