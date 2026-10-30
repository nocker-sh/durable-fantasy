import * as THREE from "three"
import { colorMat, mat } from "../gfx"
import { M } from "../build"
import { PixBuf, Rng, RAMPS, hash2, hex } from "../pix"
import { leafTex } from "../textures"
import { blockCircle, groundH } from "../world"
import { type Spot, instanced } from "./instancing.ts"

const pineMat = mat(leafTex("moss", 31))

const frostMat = mat(leafTex("frost", 32))

const greyWood = colorMat(0x6a625e)

const rust = colorMat(0x7a4a3a)

const rustDark = colorMat(0x4a2e2a)

const capRed = colorMat(0xa83a32)

const capBrown = colorMat(0x8a6a4a)

const stem = colorMat(0xe0d6c0)

const trunkGeo = new THREE.CylinderGeometry(0.08, 0.13, 1, 6).translate(0, 0.5, 0)

const coneGeo = new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0)

const crownGeo = new THREE.IcosahedronGeometry(1, 0)

const rockGeo = new THREE.DodecahedronGeometry(0.5, 0)

const logGeo = new THREE.CylinderGeometry(0.18, 0.21, 1, 7).rotateZ(Math.PI / 2)

const stumpGeo = new THREE.CylinderGeometry(0.2, 0.26, 0.32, 7).translate(0, 0.12, 0)

const capGeo = new THREE.ConeGeometry(0.09, 0.07, 6).translate(0, 0.12, 0)

const stemGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.1, 5).translate(0, 0.05, 0)

const tuftMat = (() => {
  const b = new PixBuf(24, 18)
  const r = new Rng(77)
  for (let k = 0; k < 16; k++) {
    const x0 = 3 + r.int(18),
      lean = r.next() < 0.5 ? -1 : 1,
      h = 8 + r.int(9)
    for (let t = 0; t < h; t++) b.set(Math.min(23, Math.max(0, x0 + Math.round((t / h) ** 2 * 3 * lean))), 17 - t, RAMPS.thatch[1 + Math.min(4, Math.floor((t / h) * 4) + r.int(2))])
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

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

export function pines(root: THREE.Group, spots: Spot[], frosty = true) {
  instanced(root, trunkGeo, M.woodDark, spots, (s) => [
    [s.x, s.z],
    [0, s.r, 0],
    [s.s, s.s * 1.1, s.s],
  ])
  const tiers: [number, number, number][] = [
    [0.95, 1.3, 0.6],
    [0.72, 1.1, 1.3],
    [0.46, 0.95, 1.95],
  ]
  // frost on the tops of some trees, the ones standing in the open
  const white = (s: Spot) => frosty && hash2(Math.floor(s.x * 7), Math.floor(s.z * 7), 9) < 0.35
  tiers.forEach(([rad, h, y], i) => {
    const at = (s: Spot): ReturnType<Parameters<typeof instanced>[4]> => [
      [s.x, groundH(s.x, s.z) + y * s.s, s.z],
      [0, s.r + i, 0],
      [rad * s.s, h * s.s, rad * s.s],
    ]
    if (i < 2) instanced(root, coneGeo, pineMat, spots, at)
    else {
      instanced(root, coneGeo, frostMat, spots.filter(white), at)
      instanced(
        root,
        coneGeo,
        pineMat,
        spots.filter((s) => !white(s)),
        at,
      )
    }
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.3 * s.s)
}

export function broadleaves(root: THREE.Group, spots: Spot[], leaf: THREE.Material = M.leaf2) {
  instanced(root, trunkGeo, M.woodDark, spots, (s) => [
    [s.x, s.z],
    [0, s.r, 0],
    [s.s * 1.2, s.s * 1.5, s.s * 1.2],
  ])
  for (let k = 0; k < 3; k++) {
    instanced(root, crownGeo, leaf, spots, (s) => {
      const a = s.r + k * 2.1
      return [
        [s.x + Math.cos(a) * 0.35 * s.s, groundH(s.x, s.z) + (1.6 + k * 0.25) * s.s, s.z + Math.sin(a) * 0.35 * s.s],
        [a, a * 2, 0],
        [0.75 * s.s, 0.65 * s.s, 0.75 * s.s],
      ]
    })
  }
  for (const s of spots) blockCircle(s.x, s.z, 0.32 * s.s)
}

export function deadTrees(root: THREE.Group, spots: Spot[]) {
  instanced(root, trunkGeo, greyWood, spots, (s) => [
    [s.x, s.z],
    [0.05, s.r, 0.04],
    [s.s * 1.1, s.s * 2.2, s.s * 1.1],
  ])
  instanced(root, trunkGeo, greyWood, spots, (s) => [
    [s.x, groundH(s.x, s.z) + 1.2 * s.s, s.z],
    [0.9, s.r, 0.3],
    [s.s * 0.6, s.s * 0.9, s.s * 0.6],
  ])
  for (const s of spots) blockCircle(s.x, s.z, 0.25 * s.s)
}

export function rocks(root: THREE.Group, spots: Spot[], material: THREE.Material = M.rock) {
  instanced(root, rockGeo, material, spots, (s) => [
    [s.x, groundH(s.x, s.z) + 0.12 * s.s, s.z],
    [s.r, s.r * 3, s.r * 0.5],
    [s.s, s.s * 0.62, s.s * 0.85],
  ])
  for (const s of spots) if (s.s > 0.6) blockCircle(s.x, s.z, 0.4 * s.s)
}

export function tufts(root: THREE.Group, spots: Spot[]) {
  instanced(root, tuftGeo, tuftMat, spots, (s) => [
    [s.x, s.z],
    [0, s.r, 0],
    [s.s, s.s, s.s],
  ])
}

export function logs(root: THREE.Group, spots: Spot[], material: THREE.Material = M.woodDark) {
  instanced(root, logGeo, material, spots, (s) => [
    [s.x, groundH(s.x, s.z) + 0.16, s.z],
    [0, s.r, 0],
    [s.s * 2.4, 1, 1],
  ])
  for (const s of spots) for (let t = -1; t <= 1; t += 0.5) blockCircle(s.x + Math.cos(s.r) * t * s.s * 1.1, s.z - Math.sin(s.r) * t * s.s * 1.1, 0.25)
}

export function stumps(root: THREE.Group, spots: Spot[]) {
  instanced(root, stumpGeo, M.wood, spots, (s) => [
    [s.x, s.z],
    [0, s.r, 0],
    [s.s, s.s, s.s],
  ])
  for (const s of spots) blockCircle(s.x, s.z, 0.25 * s.s)
}

export function mushrooms(root: THREE.Group, spots: Spot[]) {
  // little clusters of three: food for the inn's soup
  const all: Spot[] = spots.flatMap((s) => [0, 1, 2].map((k) => ({ x: s.x + Math.cos(s.r + k * 2) * 0.14, z: s.z + Math.sin(s.r + k * 2) * 0.14, s: s.s * (1 - k * 0.2), r: s.r + k })))
  instanced(root, stemGeo, stem, all, (s) => [
    [s.x, s.z],
    [0, 0, 0],
    [s.s, s.s, s.s],
  ])
  instanced(
    root,
    capGeo,
    capRed,
    all.filter((_, i) => i % 2 === 0),
    (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s, s.s],
    ],
  )
  instanced(
    root,
    capGeo,
    capBrown,
    all.filter((_, i) => i % 2 === 1),
    (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s, s.s],
    ],
  )
}

const shrubGeo = new THREE.IcosahedronGeometry(1, 0).scale(1, 0.62, 1).translate(0, 0.32, 0)

const branchGeo = new THREE.CylinderGeometry(0.03, 0.045, 1, 5).rotateZ(Math.PI / 2)

const shrubMat = mat(leafTex("moss", 41))

const berry = colorMat(0x8a2a3a)

/** Low shrubs, the size of a crouching person: some keep a few dark berries through the cold. */
export function shrubs(root: THREE.Group, spots: Spot[]) {
  instanced(root, shrubGeo, shrubMat, spots, (s) => [
    [s.x, s.z],
    [0, s.r, 0],
    [0.45 * s.s, 0.5 * s.s, 0.4 * s.s],
  ])
  const berries = spots
    .filter((_, i) => i % 3 === 0)
    .flatMap((s) => [0, 1, 2].map((k) => ({ x: s.x + Math.cos(s.r + k * 2.1) * 0.32 * s.s, z: s.z + Math.sin(s.r + k * 2.1) * 0.3 * s.s, s: s.s, r: s.r })))
  instanced(root, stemGeo, berry, berries, (b) => [
    [b.x, groundH(b.x, b.z) + 0.32 * b.s, b.z],
    [0, 0, 0],
    [1.6, 0.6, 1.6],
  ])
  for (const sp of spots) if (sp.s > 0.8) blockCircle(sp.x, sp.z, 0.3 * sp.s)
}

/** Fallen branches lying in the grass or the needles, a few together; they block nothing. */
export function branches(root: THREE.Group, spots: Spot[], material: THREE.Material = M.woodDark) {
  const all = spots.flatMap((s) => [0, 1, 2].map((k) => ({ x: s.x + Math.cos(s.r + k) * 0.25, z: s.z + Math.sin(s.r + k) * 0.25, s: s.s * (1 - k * 0.2), r: s.r + k * 0.9 })))
  instanced(root, branchGeo, material, all, (b) => [
    [b.x, groundH(b.x, b.z) + 0.04, b.z],
    [0, b.r, 0],
    [0.9 * b.s, 1, 1],
  ])
}

/** A drift of small flowers in tones the cold allows: white, pale yellow, lilac, a little blue. */
const flowerMats = [0xe8e4d8, 0xe0cc6a, 0xa890c0, 0x8aa0c8].map((c, k) => {
  const b = new PixBuf(24, 18)
  const r = new Rng(91 + k)
  for (let t = 0; t < 9; t++) {
    const x0 = 2 + r.int(20),
      h = 5 + r.int(9)
    for (let y = 0; y < h; y++) b.set(x0, 17 - y, RAMPS.moss[2 + (y % 2)])
    const head = hex(`#${c.toString(16).padStart(6, "0")}`)
    for (const [dx, dy] of [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
    ])
      b.set(Math.min(23, Math.max(0, x0 + dx)), 17 - h + dy, head)
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})

export function flowers(root: THREE.Group, spots: Spot[]) {
  flowerMats.forEach((m, k) =>
    instanced(
      root,
      tuftGeo,
      m,
      spots.filter((_, i) => i % flowerMats.length === k),
      (s) => [
        [s.x, s.z],
        [0, s.r, 0],
        [s.s * 0.8, s.s * 0.7, s.s * 0.8],
      ],
    ),
  )
}

/** Reeds at the water's edge: tall, thin, gone brown at the tips. */
const reedMat = (() => {
  const b = new PixBuf(24, 32)
  const r = new Rng(97)
  for (let k = 0; k < 14; k++) {
    const x0 = 1 + r.int(22),
      h = 18 + r.int(13),
      lean = r.next() < 0.5 ? -1 : 1
    for (let t = 0; t < h; t++) b.set(Math.min(23, Math.max(0, x0 + Math.round((t / h) ** 3 * 2 * lean))), 31 - t, t > h - 5 && k % 3 === 0 ? RAMPS.wood[2] : RAMPS.moss[1 + Math.min(3, Math.floor((t / h) * 3))])
  }
  return mat(b, { alpha: true, side: THREE.DoubleSide })
})()

export function reeds(root: THREE.Group, spots: Spot[]) {
  instanced(root, tuftGeo, reedMat, spots, (s) => [
    [s.x, s.z],
    [0, s.r, 0],
    [s.s, s.s * 2.6, s.s],
  ])
}

export { rust, rustDark, trunkGeo, rockGeo }
