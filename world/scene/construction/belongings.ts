// The small things a household lives with, drawn in a room you walk into (town.md「屋内マップ」):
// what hangs on its walls (the plans' wall pieces, town/fit.ts SIZES "wall"), what is left lying
// about (town/traces.ts), and what every room of its kind has — pegs by the door with coats on
// them, a rack of plates over the kitchen board, onions and herbs hung from the beams.
import type * as THREE from "three"
import { colorMat, mat } from "../gfx"
import { hash2 } from "../pix"
import { plainTex } from "../textures"
import { Kit, type Wood } from "./furnishings.ts"
import { M } from "./materials.ts"

const cloth = ["cRed", "cBlue", "cMustard", "cGreen", "cPlum", "cWine", "cSky", "cHoney", "cBrown", "cGray"].map((r) => mat(plainTex(r, 0.55, 0.2, 9, 16)))
const linen = mat(plainTex("cLinen", 0.75, 0.12, 5, 16))
const leather = mat(plainTex("leather", 0.5, 0.2, 7, 16))
const paper = colorMat(0xe8dcc0)
const ink = colorMat(0x2a2a3a)
const clay = mat(plainTex("redsand", 0.5, 0.2, 7, 16))
const glaze = [colorMat(0x5a7a7a), colorMat(0x8a5a3a), colorMat(0xb8a888), colorMat(0x4a5a7a)]
const brass = colorMat(0xb89a4a)
const wax = colorMat(0xe8dcb8)
const flame = colorMat(0xffc860)
const herb = [colorMat(0x5a7a4a), colorMat(0x7a8a5a), colorMat(0x8a7a9a)]
const onion = colorMat(0xc89a5a)
const garlic = colorMat(0xe0d8c8)
const willow = mat(plainTex("thatch", 0.55, 0.3, 11, 16))
const slate = colorMat(0x3a3e48)
const crystal = colorMat(0xa8d0e0)
const bread = colorMat(0x7a5236)
const cheese = colorMat(0xe0c070)
const apple = colorMat(0xa83a3a)
const fish = colorMat(0x8a9aa8)
const meat = colorMat(0x8a4a3a)
const hide = colorMat(0x8a6a4a)
const sausage = colorMat(0x7a3a2a)
const coal = colorMat(0x22222a)
const glass = colorMat(0x8aa8b0)
const steam = colorMat(0x5a5a62)

const r = (seed: number, n: number) => hash2(seed, n, 83)
const pick = <T>(xs: readonly T[], seed: number, n = 0) => xs[Math.floor(r(seed, n) * xs.length) % xs.length]

// ---------------------------------------------------------------- the pieces of a thing

/** A garment hung by its shoulders from a peg: a coat long, an apron short. */
function garment(k: Kit, c: THREE.Material, len: number, u = 0, wide = 0.34) {
  k.box(M.woodDark, null, u - 0.02, -0.05, -0.02, u + 0.02, 0.0, 0.08) // the peg
  k.box(c, null, u - wide / 2, -len, 0.0, u + wide / 2, -0.04, 0.05)
  k.box(c, null, u - wide / 2 - 0.04, -len * 0.55, 0.0, u - wide / 2, -0.06, 0.04) // sleeves
  k.box(c, null, u + wide / 2, -len * 0.55, 0.0, u + wide / 2 + 0.04, -0.06, 0.04)
}

/** A bundle tied at the top and hung head down: herbs, onions on a string, candle wicks. */
function bunch(k: Kit, m: THREE.Material, u: number, len = 0.32, n = 5, seed = 0) {
  k.box(M.rope, null, u - 0.01, -0.08, 0.02, u + 0.01, 0.0, 0.04)
  for (let i = 0; i < n; i++) {
    const du = (i - (n - 1) / 2) * 0.03
    const l = len * (0.7 + r(seed, i) * 0.3)
    k.box(m, null, u + du - 0.012, -0.08 - l, 0.01 + (i % 2) * 0.02, u + du + 0.012, -0.08, 0.035 + (i % 2) * 0.02)
  }
}

/** A string of round things (onions, garlic) hung down the wall. */
function string(k: Kit, m: THREE.Material, u: number, n = 6) {
  k.box(M.rope, null, u - 0.008, -0.05 - n * 0.07, 0.03, u + 0.008, 0, 0.045)
  for (let i = 0; i < n; i++) k.box(m, null, u - 0.045 + (i % 2) * 0.02, -0.09 - i * 0.07, 0.0, u + 0.035 + (i % 2) * 0.02, -0.03 - i * 0.07, 0.08)
}

/** A board on two brackets, standing out from the wall, things set along it. */
function wallShelf(k: Kit, wd: Wood, W: number, things: (u: number, i: number) => number) {
  k.box(wd.top, wd.top, -W / 2, 0, 0, W / 2, 0.035, 0.2)
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.08) - 0.02, -0.15, 0, su * (W / 2 - 0.08) + 0.02, 0, 0.16)
  let u = -W / 2 + 0.06
  for (let i = 0; u < W / 2 - 0.08; i++) u += things(u, i)
}

/** A pot, a jug, a bowl: the round things on shelves and tables. */
function vessel(k: Kit, u: number, v: number, y: number, seed: number, n: number) {
  const kind = r(seed, n)
  const m = kind < 0.3 ? clay : pick(glaze, seed, n + 1)
  if (kind < 0.45) k.cyl(m, null, u + 0.06, v, y, y + 0.14 + r(seed, n + 2) * 0.06, 0.05, 0.035, 7) // a jug
  else if (kind < 0.75) k.cyl(m, null, u + 0.07, v, y, y + 0.06, 0.05, 0.075, 8) // a bowl
  else k.box(m, m, u, y, v - 0.07, u + 0.02, y + 0.16, v + 0.07) // a plate stood up
}

function candle(k: Kit, u: number, v: number, y: number, tall = 0.14) {
  k.cyl(brass, null, u, v, y, y + 0.02, 0.045, 0.045, 6)
  k.cyl(wax, null, u, v, y + 0.02, y + 0.02 + tall, 0.014, 0.014, 5)
  k.box(flame, null, u - 0.007, y + 0.02 + tall, v - 0.007, u + 0.007, y + 0.05 + tall, v + 0.007)
}

function book(k: Kit, u: number, v: number, y: number, seed: number, open = false) {
  const c = pick(cloth, seed, 3)
  if (open) {
    k.box(c, null, u - 0.17, y, v - 0.11, u + 0.17, y + 0.015, v + 0.11)
    k.box(paper, paper, u - 0.16, y + 0.015, v - 0.1, u - 0.005, y + 0.03, v + 0.1)
    k.box(paper, paper, u + 0.005, y + 0.015, v - 0.1, u + 0.16, y + 0.03, v + 0.1)
    for (let i = 0; i < 4; i++) k.box(ink, null, u - 0.13, y + 0.031, v - 0.07 + i * 0.04, u - 0.04, y + 0.032, v - 0.065 + i * 0.04)
  } else k.box(c, paper, u - 0.1, y, v - 0.14, u + 0.1, y + 0.05, v + 0.14)
}

function papers(k: Kit, u: number, v: number, y: number, seed: number, n = 3) {
  for (let i = 0; i < n; i++) {
    const du = (r(seed, i) - 0.5) * 0.08,
      dv = (r(seed, i + 9) - 0.5) * 0.08
    k.box(paper, paper, u + du - 0.1, y + i * 0.004, v + dv - 0.14, u + du + 0.1, y + i * 0.004 + 0.004, v + dv + 0.14)
  }
  k.box(ink, null, u - 0.06, y + n * 0.004, v - 0.08, u + 0.04, y + n * 0.004 + 0.002, v - 0.07)
}

function shoes(k: Kit, u: number, v: number, m: THREE.Material, tall = false, pairs = 1) {
  for (let p = 0; p < pairs; p++)
    for (const s of [-1, 1]) {
      const cu = u + p * 0.28 + s * 0.06
      k.box(m, null, cu - 0.04, 0, v - 0.1, cu + 0.04, 0.06, v + 0.1)
      if (tall) k.box(m, null, cu - 0.04, 0.06, v - 0.1, cu + 0.04, 0.3, v - 0.02)
    }
}

function basket(k: Kit, u: number, v: number, seed: number, fill?: THREE.Material) {
  k.cyl(willow, null, u, v, 0, 0.16, 0.12, 0.15, 8)
  k.box(willow, null, u - 0.13, 0.16, v - 0.01, u + 0.13, 0.3, v + 0.01) // the handle, stood up
  if (fill) for (let i = 0; i < 5; i++) k.cyl(fill, fill, u + (r(seed, i) - 0.5) * 0.14, v + (r(seed, i + 5) - 0.5) * 0.14, 0.12, 0.18, 0.04, 0.03, 5)
}

function tool(k: Kit, u: number, kind: "axe" | "saw" | "plane" | "chisel" | "hoe" | "spade" | "shears" | "broom" | "knife") {
  // hung on two pegs: the handle down the wall, its iron at the top
  const h = kind === "hoe" || kind === "spade" || kind === "broom" ? 1.2 : 0.5
  if (kind === "saw") {
    k.box(M.iron, null, u - 0.25, -0.18, 0.01, u + 0.2, -0.05, 0.02)
    k.box(M.woodDark, null, u + 0.2, -0.17, 0.0, u + 0.3, -0.04, 0.035)
    return
  }
  if (kind === "plane") {
    k.box(M.wood, M.woodDark, u - 0.13, -0.1, 0.0, u + 0.13, 0, 0.08)
    k.box(M.iron, null, u - 0.02, -0.02, 0.02, u + 0.02, 0.02, 0.06)
    return
  }
  if (kind === "shears") {
    for (const s of [-1, 1]) k.box(M.iron, null, u + s * 0.02 - 0.01, -0.3, 0.01, u + s * 0.02 + 0.01, 0, 0.03)
    return
  }
  k.box(M.woodV, null, u - 0.015, -h, 0.01, u + 0.015, 0, 0.04)
  if (kind === "axe") k.box(M.iron, null, u - 0.02, -0.12, 0.0, u + 0.12, 0, 0.05)
  else if (kind === "hoe") k.box(M.iron, null, u - 0.09, -0.06, 0.0, u + 0.09, 0, 0.12)
  else if (kind === "spade") k.box(M.iron, null, u - 0.09, -h - 0.25, 0.0, u + 0.09, -h, 0.03)
  else if (kind === "broom") k.box(M.hay, null, u - 0.1, -h - 0.35, 0.0, u + 0.1, -h, 0.06)
  else if (kind === "chisel") k.box(M.iron, null, u - 0.01, -h - 0.12, 0.01, u + 0.01, -h, 0.03)
  else k.box(M.iron, null, u - 0.015, -h - 0.18, 0.015, u + 0.02, -h, 0.025)
}

function frame(k: Kit, W: number, H: number, inside: THREE.Material, wd: Wood) {
  k.box(wd.dark, null, -W / 2, -H, 0, W / 2, 0, 0.03)
  k.box(inside, null, -W / 2 + 0.04, -H + 0.04, 0.03, W / 2 - 0.04, -0.04, 0.035)
}

// ---------------------------------------------------------------- things on the walls

/**
 * What hangs on a wall, by name. The kit stands on the wall: u along it, v out from it (0 at the
 * wall), y up from the hook (the floor is far below; things hang down from 0).
 */
type OnWall = (k: Kit, wd: Wood, seed: number) => void

export const ON_WALLS: Record<string, OnWall> = {
  干し網: (k) => {
    for (let i = 0; i < 6; i++) k.box(M.rope, null, -0.4 + i * 0.16, -0.7, 0.01, -0.39 + i * 0.16, 0, 0.02)
    for (let j = 0; j < 5; j++) k.box(M.rope, null, -0.4, -0.7 + j * 0.16, 0.01, 0.42, -0.69 + j * 0.16, 0.02)
    for (const u of [-0.25, 0.1, 0.3]) k.box(fish, null, u - 0.03, -0.45, 0.02, u + 0.03, -0.25, 0.04)
  },
  吊るした服: (k, _w, s) => [-0.3, 0.05, 0.4].forEach((u, i) => garment(k, pick(cloth, s, i), 0.7 + r(s, i) * 0.3, u, 0.28)),
  吊るした革: (k, _w, s) => [-0.25, 0.2].forEach((u, i) => k.box(i ? leather : hide, null, u - 0.2, -0.7 - r(s, i) * 0.2, 0.01, u + 0.2, -0.04, 0.03)),
  干した皮: (k) => {
    // a hide stretched on a frame of poles, tied at the corners
    for (const su of [-1, 1]) k.box(M.woodV, null, su * 0.42 - 0.02, -1.0, 0.0, su * 0.42 + 0.02, 0.02, 0.04)
    for (const y of [0, -0.98]) k.box(M.woodV, null, -0.44, y - 0.02, 0.0, 0.44, y + 0.02, 0.04)
    k.box(hide, null, -0.36, -0.9, 0.04, 0.36, -0.08, 0.05)
  },
  吊るした薬草: (k, _w, s) => [-0.35, -0.15, 0.05, 0.25, 0.45].forEach((u, i) => bunch(k, pick(herb, s, i), u, 0.3, 5, s + i)),
  姿見: (k, wd) => {
    frame(k, 0.45, 1.3, glass, wd)
    k.box(colorMat(0xd8e4ea), null, -0.12, -0.9, 0.035, -0.04, -0.3, 0.04) // a gleam
  },
  盾の壁掛け: (k, _w, s) => {
    k.cyl(M.woodDark, null, 0, 0, -0.5, 0.0, 0.3, 0.3, 10)
    k.box(pick(cloth, s), null, -0.04, -0.48, 0.0, 0.04, -0.02, 0.32)
    k.box(M.iron, null, -0.06, -0.31, 0.29, 0.06, -0.19, 0.33)
  },
  町の絵地図: (k, wd) => {
    frame(k, 1.1, 0.75, paper, wd)
    k.box(colorMat(0x6a8a6a), null, -0.4, -0.6, 0.036, -0.05, -0.2, 0.04)
    k.box(colorMat(0x5a7a9a), null, 0.05, -0.7, 0.036, 0.1, -0.08, 0.04)
    k.box(colorMat(0x9a6a4a), null, 0.15, -0.5, 0.036, 0.42, -0.3, 0.04)
  },
  地図の束: (k) => {
    for (let i = 0; i < 4; i++) k.cyl(paper, paper, -0.2 + i * 0.12, 0.08, -0.6, -0.05, 0.035, 0.035, 6)
    k.box(M.woodDark, null, -0.3, -0.62, 0, 0.3, -0.58, 0.16)
  },
  斧掛け: (k) => [-0.25, 0.1].forEach((u) => tool(k, u, "axe")),
  杖掛け: (k) => {
    k.box(M.woodDark, null, -0.4, -0.04, 0, 0.4, 0, 0.1)
    for (let i = 0; i < 3; i++) k.box(M.woodV, null, -0.25 + i * 0.25 - 0.015, -1.4, 0.04, -0.25 + i * 0.25 + 0.015, 0.05, 0.07)
  },
  弓掛け: (k) => {
    for (let i = 0; i < 3; i++) {
      k.box(M.woodDark, null, -0.45, -0.02 - i * 0.3, 0, 0.45, 0.02 - i * 0.3, 0.06)
      k.box(M.linen, null, -0.43, -0.07 - i * 0.3, 0.05, 0.43, -0.065 - i * 0.3, 0.055)
    }
  },
  鉢植え: (k, wd, s) =>
    wallShelf(k, wd, 0.8, (u, i) => {
      k.cyl(clay, null, u + 0.08, 0.1, 0.035, 0.15, 0.06, 0.07, 7)
      k.cyl(pick(herb, s, i), null, u + 0.08, 0.1, 0.15, 0.25 + r(s, i) * 0.1, 0.08, 0.02, 6)
      return 0.22
    }),
  乳鉢: (k, wd) =>
    wallShelf(k, wd, 0.6, (u, i) => {
      if (i === 0) {
        k.cyl(M.stone, null, u + 0.1, 0.1, 0.035, 0.12, 0.08, 0.06, 8)
        k.box(M.stoneDark, null, u + 0.08, 0.1, 0.06, u + 0.11, 0.2, 0.09)
      } else k.cyl(glass, null, u + 0.05, 0.1, 0.035, 0.17, 0.04, 0.03, 6)
      return i === 0 ? 0.24 : 0.12
    }),
  鉋と鋸: (k) => {
    tool(k, -0.3, "saw")
    tool(k, 0.25, "plane")
    tool(k, 0.45, "chisel")
  },
  石鑿と槌: (k) => {
    tool(k, -0.2, "chisel")
    tool(k, -0.05, "chisel")
    k.box(M.woodV, null, 0.2, -0.4, 0.01, 0.23, 0, 0.04)
    k.box(M.iron, null, 0.14, -0.08, 0.0, 0.3, 0.0, 0.08)
  },
  縄の束: (k) => {
    for (let i = 0; i < 3; i++) k.cyl(M.rope, null, -0.25 + i * 0.25, 0.08, -0.35, -0.05, 0.1, 0.1, 8)
  },
  荷車の車輪: (k) => {
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2
      k.box(M.woodDark, null, Math.cos(a) * 0.4 - 0.03, -0.45 + Math.sin(a) * 0.4 - 0.03, 0.0, Math.cos(a) * 0.4 + 0.03, -0.45 + Math.sin(a) * 0.4 + 0.03, 0.05)
    }
    k.box(M.woodDark, null, -0.38, -0.47, 0.01, 0.38, -0.43, 0.04)
    k.box(M.woodDark, null, -0.02, -0.83, 0.01, 0.02, -0.07, 0.04)
  },
  鋤と鍬: (k) => {
    tool(k, -0.25, "hoe")
    tool(k, 0.1, "spade")
  },
  取引の掲示板: (k, wd) => {
    frame(k, 1.0, 0.7, colorMat(0x9a7a52), wd)
    for (let i = 0; i < 6; i++) k.box(paper, null, -0.38 + (i % 3) * 0.27, -0.6 + Math.floor(i / 3) * 0.28, 0.035, -0.18 + (i % 3) * 0.27, -0.42 + Math.floor(i / 3) * 0.28, 0.04)
  },
  ランタンの棚: (k, wd) =>
    wallShelf(k, wd, 1.0, (u) => {
      k.box(M.iron, glass, u, 0.035, 0.04, u + 0.12, 0.22, 0.16)
      return 0.2
    }),
  紙の束: (k, wd, s) =>
    wallShelf(k, wd, 0.8, (u, i) => {
      for (let j = 0; j < 4 + Math.floor(r(s, i) * 4); j++) k.box(paper, paper, u, 0.035 + j * 0.012, 0.03, u + 0.2, 0.045 + j * 0.012, 0.17)
      return 0.26
    }),
  芯の束: (k, _w, s) => [-0.2, 0.0, 0.2].forEach((u, i) => bunch(k, wax, u, 0.35, 6, s + i)),
  煙突ぶらし: (k) => {
    k.box(M.woodV, null, -0.02, -1.3, 0.01, 0.02, 0, 0.04)
    k.cyl(M.dark, null, 0, 0.1, 0.0, 0.15, 0.12, 0.12, 8)
    k.box(M.rope, null, 0.15, -0.5, 0.01, 0.35, -0.05, 0.08)
  },
  砥石: (k, wd) =>
    wallShelf(k, wd, 0.5, (u, i) => {
      k.box(i ? M.stoneDark : M.stone, null, u, 0.035, 0.04, u + 0.16, 0.08, 0.12)
      return 0.2
    }),
  石板の束: (k, wd) =>
    wallShelf(k, wd, 0.6, (u) => {
      k.box(slate, M.woodDark, u, 0.035, 0.02, u + 0.03, 0.3, 0.18)
      return 0.08
    }),
  天秤: (k, wd) =>
    wallShelf(k, wd, 0.6, (u, i) => {
      if (i) return 0.6
      k.box(M.iron, null, u + 0.24, 0.035, 0.08, u + 0.26, 0.3, 0.1)
      k.box(M.iron, null, u + 0.05, 0.28, 0.08, u + 0.45, 0.3, 0.1)
      for (const du of [0.08, 0.42]) k.cyl(brass, null, u + du, 0.09, 0.08, 0.1, 0.07, 0.07, 8)
      return 0.6
    }),
  腸詰めの吊るし: (k) => {
    // a pole on two brackets, loops of sausage and a ham hung from it to smoke and dry
    k.box(M.woodDark, null, -0.5, -0.04, 0.02, 0.5, 0, 0.12)
    for (let i = 0; i < 7; i++) {
      const u = -0.42 + i * 0.12
      const l = 0.35 + (i % 3) * 0.08
      k.box(sausage, null, u - 0.025, -l, 0.05, u + 0.025, -0.04, 0.1)
      k.box(sausage, null, u + 0.025, -l + 0.02, 0.05, u + 0.06, -0.04, 0.1)
    }
    k.box(meat, null, 0.38, -0.55, 0.03, 0.5, -0.08, 0.14)
  },
  // the pot hangs over the fire on its hook (drawn with the fire)
  大鍋: () => {},
}

/** What every room of a kind has on its walls, to choose from by the house's seed. */
const BY_USE: Record<string, readonly OnWall[]> = {
  台所: [
    // a plate rack, a row of ladles and spoons, a string of onions
    (k, wd, s) => wallShelf(k, wd, 1.0, (u, i) => (vessel(k, u, 0.1, 0.035, s, i), 0.16)),
    (k) => {
      k.box(M.woodDark, null, -0.4, -0.04, 0, 0.4, 0, 0.05)
      for (let i = 0; i < 5; i++) {
        const u = -0.32 + i * 0.16
        k.box(i % 2 ? M.iron : M.woodV, null, u - 0.01, -0.35, 0.02, u + 0.01, -0.02, 0.035)
        k.cyl(i % 2 ? M.iron : M.woodV, null, u, 0.04, -0.4, -0.34, 0.035, 0.035, 6)
      }
    },
    (k) => [-0.15, 0.15].forEach((u, i) => string(k, i ? garlic : onion, u, 6)),
    (k) => {
      // pans hung by their handles
      for (const [u, rr] of [
        [-0.25, 0.14],
        [0.15, 0.18],
      ] as const) {
        k.box(M.iron, null, u - 0.015, -0.2, 0.0, u + 0.015, 0, 0.03)
        k.cyl(M.iron, null, u, 0.05, -0.2 - rr * 2, -0.2, rr, rr, 9)
      }
    },
  ],
  食事: [
    (k, wd, s) => wallShelf(k, wd, 1.1, (u, i) => (vessel(k, u, 0.1, 0.035, s, i + 3), 0.18)),
    (k, wd, s) => {
      // a picture of somebody's family, or a pressed flower in a frame
      frame(k, 0.4, 0.5, pick(cloth, s, 7), wd)
      k.box(paper, null, -0.08, -0.32, 0.036, 0.08, -0.14, 0.04)
    },
    (k) => {
      // a sconce with a candle
      k.box(brass, null, -0.04, -0.15, 0, 0.04, 0, 0.1)
      candle(k, 0, 0.1, -0.05, 0.12)
    },
    (k, wd) => {
      // the calendar of the chapel's days, its leaves turned up
      frame(k, 0.35, 0.45, paper, wd)
      for (let i = 0; i < 5; i++) k.box(ink, null, -0.12, -0.12 - i * 0.06, 0.036, 0.1, -0.11 - i * 0.06, 0.04)
    },
  ],
  作業場: [
    (k) => {
      // a peg board of the trade's tools
      k.box(M.woodDark, null, -0.5, -0.6, 0, 0.5, 0, 0.02)
      tool(k, -0.35, "saw")
      tool(k, 0.0, "shears")
      tool(k, 0.25, "knife")
    },
    (k, wd, s) =>
      wallShelf(k, wd, 1.0, (u, i) => {
        if (r(s, i) > 0.5) k.box(M.woodDark, M.iron, u, 0.035, 0.03, u + 0.2, 0.12, 0.17)
        else k.cyl(clay, null, u + 0.07, 0.1, 0.035, 0.18, 0.06, 0.05, 7)
        return 0.24
      }),
    (k, _w, s) => garment(k, pick([leather, linen], s), 0.8),
  ],
  売り場: [
    (k, wd) => {
      // the board of prices, chalked
      frame(k, 0.7, 0.5, slate, wd)
      for (let i = 0; i < 5; i++) k.box(wax, null, -0.25, -0.12 - i * 0.07, 0.036, -0.25 + 0.2 + (i % 3) * 0.1, -0.11 - i * 0.07, 0.04)
    },
    (k, wd, s) => wallShelf(k, wd, 1.0, (u, i) => (vessel(k, u, 0.1, 0.035, s, i + 7), 0.18)),
    (k) => {
      k.box(brass, null, -0.04, -0.15, 0, 0.04, 0, 0.1)
      candle(k, 0, 0.1, -0.05, 0.12)
    },
  ],
  土間: [(k, _w, s) => [-0.25, 0.1].forEach((u, i) => garment(k, pick(cloth, s, i), 0.85, u, 0.3)), (k) => [-0.2, 0.2].forEach((u, i) => tool(k, u, i ? "broom" : "spade"))],
  貯蔵: [
    (k) => [-0.25, 0.0, 0.25].forEach((u, i) => string(k, i === 1 ? garlic : onion, u, 7)),
    (k) => {
      k.box(M.woodDark, null, -0.3, -0.05, 0, 0.3, 0, 0.1)
      k.box(meat, null, -0.08, -0.45, 0.02, 0.08, -0.05, 0.12)
    },
  ],
}
BY_USE["住まい"] = BY_USE["食事"]
BY_USE["客室"] = BY_USE["食事"]

/** A wall piece of the plan, or a thing every room of its use has; the kit stands on the wall at the hook. */
export function hang(k: Kit, wd: Wood, what: { piece?: string; use?: string }, seed: number): boolean {
  const f = what.piece ? ON_WALLS[what.piece] : what.use ? pick(BY_USE[what.use] ?? BY_USE["食事"], seed, 1) : undefined
  if (!f) return false
  f(k, wd, seed)
  return true
}

/** How high the hook of a wall thing is (tiles above the floor). */
export const hookOf = (piece: string | undefined) => (piece && /網|服|革|皮|姿見|杖|鋤|煙突|車輪/.test(piece) ? 1.75 : 1.5)

// ---------------------------------------------------------------- what is left lying about

type Lying = (k: Kit, seed: number, name: string) => void

/** The things of town/traces.ts, by what their names say. Drawn where they lie (y 0 is what they lie on). */
const LYING: [RegExp, Lying][] = [
  [/外套|泥除け/, (k, s) => k.box(pick(cloth, s), null, -0.25, 0, -0.15, 0.25, 0.06, 0.18)],
  [/前掛け/, (k) => k.box(linen, null, -0.18, 0, -0.12, 0.18, 0.03, 0.14)],
  [/膝掛け/, (k, s) => k.box(pick(cloth, s), null, -0.28, 0, -0.2, 0.28, 0.05, 0.2)],
  [/靴下/, (k, s) => [-0.08, 0.08].forEach((u) => k.box(pick(cloth, s), null, u - 0.04, 0, -0.1, u + 0.04, 0.03, 0.1))],
  [/手袋/, (k) => [-0.07, 0.07].forEach((u) => k.box(leather, null, u - 0.05, 0, -0.08, u + 0.05, 0.03, 0.08))],
  [/帽子/, (k, s) => (k.cyl(pick(cloth, s), null, 0, 0, 0, 0.02, 0.16, 0.16, 8), k.cyl(pick(cloth, s), null, 0, 0, 0.02, 0.12, 0.09, 0.08, 8))],
  [/首巻き|型紙|布/, (k, s) => k.box(pick(cloth, s), null, -0.2, 0, -0.06, 0.2, 0.025, 0.06)],
  [/長靴/, (k, s) => shoes(k, -0.15, 0, leather, true, 1 + Math.floor(r(s, 1) * 2))],
  [/靴|室内履き|木靴/, (k, _s, n) => shoes(k, -0.06, 0, /木靴/.test(n) ? M.wood : leather)],
  [/手紙|書き付け|議事録|帳面|交代表|札|手習い/, (k, s) => papers(k, 0, 0, 0, s)],
  [/本|宿帳|帳簿/, (k, s) => book(k, 0, 0, 0, s, true)],
  [/石板/, (k) => (k.box(M.woodDark, null, -0.15, 0, -0.11, 0.15, 0.02, 0.11), k.box(slate, null, -0.13, 0.02, -0.09, 0.13, 0.025, 0.09))],
  [/地図/, (k) => (papers(k, 0, 0, 0, 3, 1), k.box(colorMat(0x6a8a6a), null, -0.05, 0.006, -0.06, 0.04, 0.008, 0.05))],
  [/蝋燭/, (k) => candle(k, 0, 0, 0, 0.2)],
  [/杯|茶|椀/, (k, s) => [-0.1, 0.1].forEach((u, i) => k.cyl(pick(glaze, s, i), steam, u, 0, 0, 0.09, 0.04, 0.05, 7))],
  [/皿/, (k, s) => [0, 1, 2].forEach((i) => k.cyl(pick(glaze, s, i), null, (i - 1) * 0.04, 0, i * 0.02, i * 0.02 + 0.02, 0.1, 0.11, 8))],
  [/鍋|膠|ろう/, (k) => (k.cyl(M.iron, M.dark, 0, 0, 0, 0.16, 0.14, 0.15, 9), k.box(M.iron, null, 0.14, 0.12, -0.015, 0.28, 0.14, 0.015))],
  [/壺|甕/, (k) => k.cyl(clay, M.woodDark, 0, 0, 0, 0.26, 0.1, 0.08, 8)],
  [/瓶/, (k) => k.cyl(glass, null, 0, 0, 0, 0.16, 0.04, 0.025, 6)],
  [/パン/, (k) => [-0.08, 0.1].forEach((u) => k.cyl(bread, bread, u, 0, 0, 0.07, 0.08, 0.06, 7))],
  [/チーズ/, (k) => k.cyl(linen, cheese, 0, 0, 0, 0.12, 0.13, 0.13, 8)],
  [/林檎|果/, (k, s) => basket(k, 0, 0, s, apple)],
  [/蕪|籠|笊/, (k, s, n) => basket(k, 0, 0, s, /蕪/.test(n) ? garlic : /洗濯/.test(n) ? linen : undefined)],
  [/卵/, (k, s) => basket(k, 0, 0, s, garlic)],
  [/魚/, (k) => [-0.08, 0.06].forEach((u) => k.box(fish, null, u - 0.03, 0, -0.12, u + 0.03, 0.04, 0.12))],
  [/薬草|葡萄|玉ねぎ|花冠/, (k, s) => [-0.1, 0, 0.1].forEach((u, i) => k.box(pick(herb, s, i), null, u - 0.04, 0, -0.1, u + 0.04, 0.03, 0.1))],
  [/腸詰め/, (k) => [-0.1, 0, 0.1].forEach((u) => k.box(sausage, null, u - 0.03, 0, -0.14, u + 0.03, 0.05, 0.14))],
  [/炭/, (k, s) => [0, 1, 2, 3, 4].forEach((i) => k.box(coal, null, (r(s, i) - 0.5) * 0.24, 0, (r(s, i + 5) - 0.5) * 0.18, (r(s, i) - 0.5) * 0.24 + 0.07, 0.05, (r(s, i + 5) - 0.5) * 0.18 + 0.05))],
  [/肉/, (k) => k.box(meat, null, -0.1, 0, -0.12, 0.1, 0.12, 0.12)],
  [/結晶/, (k) => (k.box(linen, null, -0.12, 0, -0.08, 0.12, 0.01, 0.08), k.cyl(crystal, null, 0.03, 0, 0.01, 0.07, 0.025, 0.005, 5))],
  [/鍵/, (k) => k.box(M.iron, null, -0.06, 0, -0.03, 0.06, 0.02, 0.03)],
  [/斧/, (k) => (k.box(M.woodV, null, -0.3, 0, -0.02, 0.2, 0.04, 0.02), k.box(M.iron, null, 0.18, 0, -0.08, 0.26, 0.04, 0.06))],
  [/包丁|鋏|鑿|針|ペン|筆/, (k) => (k.box(M.iron, null, -0.1, 0, -0.01, 0.06, 0.012, 0.01), k.box(M.woodDark, null, 0.06, 0, -0.015, 0.14, 0.02, 0.015))],
  [/剣|弓|槍|杖/, (k) => k.box(M.woodV, null, -0.35, 0, -0.025, 0.35, 0.04, 0.025)],
  [/馬/, (k) => (k.box(M.wood, null, -0.1, 0.08, -0.04, 0.1, 0.16, 0.04), k.box(M.wood, null, 0.06, 0.12, -0.03, 0.12, 0.24, 0.03), k.legs(M.woodDark, 0.08, 0.02, 0, 0.2, 0.08))],
  [/兜|胸当て|蹄鉄|火屋|呼び子|ランタン/, (k) => k.cyl(M.iron, null, 0, 0, 0, 0.1, 0.1, 0.08, 7)],
  [/縄|紐|測り縄/, (k) => k.cyl(M.rope, null, 0, 0, 0, 0.06, 0.13, 0.13, 8)],
  [/毛糸|糸巻き|編み/, (k, s) => [0, 1].forEach((i) => k.cyl(pick(cloth, s, i), pick(cloth, s, i), (i - 0.5) * 0.14, 0, 0, 0.1, 0.06, 0.05, 6))],
  [/袋|荷/, (k) => (k.cyl(M.sack, M.sack, 0, 0, 0, 0.3, 0.16, 0.12, 7), k.cyl(M.rope, null, 0, 0, 0.26, 0.29, 0.07, 0.07, 6))],
  [/板|木切れ|木の/, (k) => k.box(M.wood, null, -0.25, 0, -0.06, 0.25, 0.03, 0.06)],
  [/器|鉢|かけら/, (k, s) => [-0.12, 0.05, 0.18].forEach((u, i) => k.cyl(pick(glaze, s, i), null, u, 0, 0, 0.08, 0.04, 0.06, 7))],
  [/箱/, (k) => (k.box(M.woodDark, M.wood, -0.12, 0, -0.08, 0.12, 0.12, 0.08), k.box(brass, null, -0.03, 0.12, -0.01, 0.03, 0.125, 0.01))],
  [/火掻き|火鉢|熾火|炉/, (k) => k.box(M.iron, null, -0.02, 0, -0.25, 0.02, 0.03, 0.25)],
  [/冬毛|皮|毛/, (k) => k.box(hide, null, -0.22, 0, -0.16, 0.22, 0.05, 0.16)],
  [/桶|手桶|天秤棒/, (k) => k.cyl(M.woodV, null, 0, 0, 0, 0.22, 0.12, 0.14, 8)],
]

/** Draws what a trace's name says; false when nothing fits it. */
export function lying(k: Kit, name: string, seed: number): boolean {
  const hit = LYING.find(([re]) => re.test(name))
  if (!hit) return false
  hit[1](k, seed, name)
  return true
}

/** Hung from the beams, by the room's use: onions and garlic in a kitchen, herbs to dry anywhere they are kept. */
export function fromBeams(k: Kit, use: string, seed: number, apothecary = false) {
  const n = 2 + Math.floor(r(seed, 11) * 3)
  for (let i = 0; i < n; i++) {
    const u = (i - (n - 1) / 2) * 0.35
    if (apothecary || use === "貯蔵") bunch(k, pick(herb, seed, i), u, 0.35, 6, seed + i)
    else if (use === "台所") string(k, i % 2 ? garlic : onion, u, 5)
    else if (r(seed, i + 20) > 0.5) bunch(k, pick(herb, seed, i), u, 0.3, 5, seed + i)
  }
}
