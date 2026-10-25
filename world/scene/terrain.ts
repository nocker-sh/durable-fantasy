import { PixBuf, pick, hash2, vnoise, fbm, type RGB, hex, RAMPS, bayer } from "./pix"
import { N, FR, F, GRID_N, groundH, riverD, roadD, roadKind, inRect, smooth, currentLayout as layout, trailD } from "./world"
import { PPU } from "./textures"

/**
 * Old, much-walked cobbles, not a tidy pavement: stones of uneven tone with grain in them, lit at
 * the upper left; earth and moss in the joints, the moss spilling out over the stones' edges where
 * it is damp; stones chipped, cracked by the frost, sunk lower than the rest, or gone altogether
 * (earth and grass in the hole); dark grime and mud splashed about; and towards the edge (`edge`
 * 0–1) more and more stones missing, so the road crumbles into the ground beside it.
 */
function cobble(x: number, z: number, sx: number, sy: number, scale: number, ramp: string, base: number, seed: number, rows = true, edge = 0): RGB {
  const v = z * scale,
    row = Math.floor(v)
  const u = x * scale + (rows ? (row % 2) * 0.5 + (hash2(row, 0, seed) - 0.5) * 0.3 : 0)
  const c = Math.floor(u)
  const fu = u - c,
    fv = v - row
  // rounded stone: distance from centre, each a slightly different shape
  const dx = (fu - 0.5) * 2,
    dz = (fv - 0.5) * 2
  const sq = 2.4 + hash2(c, row, seed + 5) * 1.6
  const r = (Math.abs(dx) ** sq + Math.abs(dz) ** sq) ** (1 / sq)
  const m = vnoise(x, z, 0.9, seed + 3) * 0.75 + vnoise(x, z, 3.1, seed + 4) * 0.25 // damp, mossy places
  // a stone gone: earth in the hole, grass or moss growing in it
  if (hash2(c, row, seed + 21) > 0.955 - edge * 0.6) {
    if (r > 0.95) return pick("dirt", 0.15, sx, sy)
    const t = stampAt(sx, sy, 5, seed + 71, TUFTS, () => 0.5)
    if (t) return lvl(m > 0.5 ? "moss" : "grass", 2 + Number(t) - 3)
    return pick("dirt", 0.32 + vnoise(x, z, 6, seed + 22) * 0.25, sx, sy)
  }
  if (r > 0.82) {
    // joints: dark earth, with moss in the damp places and the odd tuft of grass
    if (m > 0.48) {
      const t = stampAt(sx, sy, 4, seed + 70, SPRIGS, () => 0.8)
      return t ? lvl("moss", 2 + Number(t) - 3) : pick("moss", 0.25 + hash2(sx, sy, 6) * 0.2, sx, sy)
    }
    if (vnoise(x, z, 1.3, seed + 3) > 0.66) return pick("grass", 0.3 + hash2(sx, sy, 2) * 0.3, sx, sy)
    return pick("dirt", 0.12 + hash2(sx, sy, 5) * 0.12, sx, sy)
  }
  // moss creeping out of the joints over the stone's rim
  if (m > 0.58 && r > 0.82 - (m - 0.58) * 2.2 && hash2(sx, sy, seed + 8) > 0.25) return pick("moss", 0.35 + hash2(sx, sy, 9) * 0.35, sx, sy)
  let b = base + (hash2(c, row, seed) - 0.5) * 0.3
  b += (-dx - dz) * 0.09 // lit from upper-left
  if (hash2(c, row, seed + 23) > 0.88) b -= 0.18 // a sunken stone, in shadow
  if (r > 0.7) b -= 0.12
  // chips knocked off the rim
  if (r > 0.62 && hash2(sx >> 1, sy >> 1, seed + 24) > 0.86) return pick("dirt", 0.2, sx, sy)
  // grit and wear in the stone
  if (hash2(sx, sy, seed + 7) > 0.93) b -= 0.15
  if (hash2(sx, sy, seed + 17) > 0.97) b += 0.12
  // grime: dark stains in broad patches, and mud splashed up from the road
  const grime = vnoise(x, z, 0.55, seed + 31)
  if (grime > 0.6) b -= (grime - 0.6) * 0.9
  if (vnoise(x, z, 1.7, seed + 41) > 0.7 && hash2(sx >> 1, sy >> 1, seed + 42) > 0.8) return pick("mud", 0.3 + hash2(sx, sy, 43) * 0.3, sx, sy)
  // here and there a stone cracked across by the frost
  if (hash2(c, row, seed + 13) > 0.9 && Math.abs(fu - fv + (hash2(c, row, seed + 14) - 0.5) * 0.4) < 0.06) b -= 0.3
  return pick(ramp, b, sx, sy, 0.45)
}

// ---------------------------------------------------------------- little drawn shapes
// The ground is not noise: it is drawn from small pixel shapes (tufts, pebbles, needles, petals)
// scattered on a jittered grid, over a few flat tones with dithered edges between them.
// In a shape: '.' nothing, digits are steps from the ground's own tone (5 = two lighter … 1 = two
// darker), letters are fixed colours.
type Stamp = readonly string[]
const TUFTS: Stamp[] = [
  [".4...4.", ".4.5.4.", "43.4.43", "3343433", ".22222."],
  ["..5..", ".545.", "43434", ".222."],
  ["4...4", "34.43", ".333.", ".222."],
  ["..4.", ".54.", "434.", "222."],
  [".5.4.", ".4.4.", "43434", ".2.2."],
]
const SPRIGS: Stamp[] = [
  ["4.", "34", "2."],
  [".4", "43", ".2"],
  ["5", "4", "2"],
]
const PEBBLES: Stamp[] = [
  [".55.", "5442", ".22."],
  ["54", "42"],
  [".54", "542", ".2."],
  ["554.", "4442", ".222"],
]
const NEEDLES: Stamp[] = [["4..", ".3.", "..2"], ["..4", ".3.", "2.."], ["43", ".2"], ["4...", ".43.", "...2"], ["34"]]
const CLOVER: Stamp[] = [
  [".p.", "pcp", ".p."],
  ["p.p", ".c.", "p.p"],
  ["pp", "pc"],
]
const LEAVES: Stamp[] = [
  [".a", "ab"],
  ["ab.", ".ba"],
  ["a.", "ba", ".b"],
]

/** The character a shape puts at a pixel, if any: shapes sit one to a cell of `cell` pixels, where `dense` (0–1, at the cell's place) allows. */
function stampAt(sx: number, sy: number, cell: number, seed: number, shapes: Stamp[], dense: (x: number, z: number) => number): string | null {
  const cx = Math.floor(sx / cell),
    cy = Math.floor(sy / cell)
  for (let oy = 0; oy >= -1; oy--)
    for (let ox = 0; ox >= -1; ox--) {
      const gx = cx + ox,
        gy = cy + oy
      const px = gx * cell + Math.floor(hash2(gx, gy, seed + 2) * cell * 0.6),
        py = gy * cell + Math.floor(hash2(gx, gy, seed + 3) * cell * 0.6)
      const st = shapes[Math.min(shapes.length - 1, Math.floor(hash2(gx, gy, seed + 1) * shapes.length))]
      const lx = sx - px,
        ly = sy - py
      if (lx < 0 || ly < 0 || ly >= st.length || lx >= st[ly].length) continue
      const ch = st[ly][lx]
      if (ch === ".") continue
      if (hash2(gx, gy, seed) > dense((px + 2) / PPU, (py + 2) / PPU)) continue
      return ch
    }
  return null
}

/** A ramp's colour at a level (0 darkest), clamped. */
const lvl = (ramp: string, i: number): RGB => {
  const r = RAMPS[ramp]
  return r[Math.max(0, Math.min(r.length - 1, i))]
}

/** Flat tones over broad patches: the level, with a checker of the next at the edge between two. */
function patchLevel(x: number, z: number, sx: number, sy: number, levels: number[], scale: number, seed: number): number {
  const v = vnoise(x, z, scale, seed) * 0.7 + vnoise(x, z, scale * 2.7, seed + 1) * 0.3
  const t = v * levels.length
  const i = Math.min(levels.length - 1, Math.floor(t))
  const f = t - i
  // where one tone gives way to the next, an ordered dither fades it in over a few pixels
  if (i < levels.length - 1 && f > 0.55 && bayer(sx, sy) + 0.47 < (f - 0.55) / 0.45) return levels[i + 1]
  return levels[i]
}

const PETALS: RGB[][] = [
  ["#f2eee2", "#f0d060"],
  ["#e08ab0", "#f2eee2"],
  ["#9a8ac8", "#f0d060"],
  ["#f0d060", "#c08040"],
].map((p) => p.map(hex))

function grass(x: number, z: number, sx: number, sy: number, ramp = "grass", bias = 0): RGB {
  const n = RAMPS[ramp].length
  const shift = Math.round(bias * (n - 1))
  const base = patchLevel(x, z, sx, sy, n >= 6 ? [1, 2, 2, 3] : [1, 2, 2], 0.42, 1) + shift
  // tufts thick where the grass is lush, sparse where it is thin; sprigs in between
  const lush = vnoise(x, z, 0.6, 5)
  const t = stampAt(sx, sy, 9, 40, TUFTS, () => 0.25 + lush * 0.55) ?? stampAt(sx + 4, sy + 3, 5, 41, SPRIGS, () => 0.22)
  if (t) return lvl(ramp, base + Number(t) - 3)
  // flowers in little clusters where they like it
  const bloom = vnoise(x, z, 0.9, 11)
  if (bloom > 0.6) {
    const f = stampAt(sx, sy, 7, 42, CLOVER, () => (bloom - 0.6) * 1.6)
    if (f) {
      const p = PETALS[Math.min(3, Math.floor(vnoise(x, z, 0.4, 12) * 4))]
      return f === "c" ? p[1] : p[0]
    }
  }
  return lvl(ramp, base)
}

function dirt(x: number, z: number, sx: number, sy: number, base = 0.45, ramp = "dirt"): RGB {
  const n = RAMPS[ramp].length
  const b0 = Math.round(base * (n - 1))
  const lv = patchLevel(x, z, sx, sy, [b0, b0 + 1, b0], 0.9, 9)
  // pebbles, each lit on its top and shadowed below
  const p = stampAt(sx, sy, 8, 50, PEBBLES, () => 0.3)
  if (p) return lvl("stone", Number(p) - 1)
  // a crack or a dropped twig now and then
  if (hash2(sx >> 2, sy, 52) > 0.985) return lvl(ramp, lv - 1)
  return lvl(ramp, lv)
}

/** Grass reaching out over the edge of a path: tufts only, so the edge is ragged, not smooth. */
function fringe(x: number, z: number, sx: number, sy: number, reach: number): RGB | null {
  const t = stampAt(sx, sy, 6, 60, TUFTS, () => reach)
  return t ? lvl("grass", 2 + Number(t) - 3) : null
}

export function paintGround(): PixBuf {
  const S = N * PPU
  const buf = new PixBuf(S, S)
  paintRows(buf, 0, S)
  return buf
}

/** The ground's size in pixels along a side. */
export const GROUND_PX = N * PPU

/** Paint rows y0..y1 of the ground into `buf` (whose first row is y0). */
export function paintRows(buf: PixBuf, y0: number, y1: number) {
  const S = N * PPU
  for (let sy = y0; sy < y1; sy++) {
    const z = (sy + 0.5) / PPU
    for (let sx = 0; sx < S; sx++) {
      const x = (sx + 0.5) / PPU
      buf.set(sx, sy - y0, ashen(groundColor(x, z, sx, sy), x, z, sx, sy))
    }
  }
}

const ASH_LIGHT: RGB = hex("#a8a49c"),
  ASH_DARK: RGB = hex("#8a867e")
/**
 * Ash over the ground (world.md「気候」): a thin grey film everywhere, lying in drifts where the
 * wind leaves it, and swept up into a grey bank along each side of a road — the road itself is
 * kept clear, with footprints in what is left on it.
 */
function ashen(c: RGB, x: number, z: number, sx: number, sy: number): RGB {
  const d = roadD(x, z)
  const drift = fbm(x, z, 0.35, 77)
  // swept to the road's edges, a hand's width either side
  const bank = d > -0.05 && d < 0.35 ? 1 - Math.abs(d - 0.15) / 0.2 : 0
  let k = 0.06 + Math.max(0, drift - 0.55) * 0.8 + Math.max(0, bank) * 0.5
  if (d < -0.05) k = 0.06 + (hash2(sx >> 1, sy >> 1, 91) > 0.9 ? 0.25 : 0)
  // pixel by pixel, so the film is grains, not a wash
  const grain = hash2(sx, sy, 93)
  if (grain > 1 - k) return grain > 1 - k * 0.4 ? ASH_LIGHT : ASH_DARK
  return c
}

function groundColor(x: number, z: number, sx: number, sy: number): RGB {
  const h = groundH(x, z)
  const dr = riverD(x, z)
  const wob = (vnoise(x, z, 2.2, 31) - 0.5) * 0.18 + (hash2(sx, sy, 33) - 0.5) * 0.06
  // river bed / banks
  if (inRect(x, z, layout().lavoir) && dr >= layout().riverHW - 0.02) return cobble(x, z, sx, sy, 2.2, "stone", 0.5, 41, true)
  if (inRect(x, z, layout().lavStairs)) return cobble(x, z, sx, sy, 2.0, "stone", 0.6, 43, false)
  if (dr < layout().riverHW + 0.05) {
    const p = hash2(sx >> 2, sy >> 2, 21)
    if (p > 0.9) return pick("stone", 0.3 + hash2(sx >> 2, sy >> 2, 22) * 0.4 - ((sy & 3) > 1 ? 0.1 : 0), sx, sy)
    return pick("mud", 0.35 + vnoise(x, z, 3, 23) * 0.4, sx, sy)
  }
  if (h < -0.75 && dr < layout().riverHW + 2.5) {
    // sandy, reedy natural bank
    if (h < -0.95) return pick("sand", 0.35 + vnoise(x, z, 4, 24) * 0.3, sx, sy)
    return vnoise(x, z, 1.5, 25) > 0.45 ? grass(x, z, sx, sy, "wild", 0.05) : pick("sand", 0.5 + vnoise(x, z, 4, 26) * 0.3, sx, sy)
  }
  // plaza
  const dx = x - layout().plaza[0],
    dz = z - layout().plaza[1]
  const dp = Math.hypot(dx, dz)
  if (dp < layout().plazaR + wob) {
    const a = Math.atan2(dz, dx)
    const ring = Math.floor(dp * 2.6)
    const nseg = 6 + ring * 7
    const sv = ((a + Math.PI) / (2 * Math.PI)) * nseg + (ring % 2) * 0.5
    const seg = Math.floor(sv)
    const fr = dp * 2.6 - ring,
      fa = sv - seg
    // old flagstones in rings: uneven, worn, mossy in the joints, the odd one cracked or gone
    const m = vnoise(x, z, 0.8, 24)
    if (hash2(seg, ring, 25) > 0.97) return fr > 0.85 || fa > 0.9 ? pick("dirt", 0.15, sx, sy) : pick(m > 0.5 ? "moss" : "dirt", 0.3 + hash2(sx, sy, 26) * 0.3, sx, sy)
    if (fr > 0.88 || fa > 0.92) return m > 0.58 ? pick("moss", 0.25 + hash2(sx, sy, 27) * 0.25, sx, sy) : pick("dirt", 0.15 + hash2(sx, sy, 28) * 0.1, sx, sy)
    if (m > 0.6 && (fr > 0.8 - (m - 0.6) * 1.5 || fa > 0.86 - (m - 0.6) * 1.2) && hash2(sx, sy, 29) > 0.3) return pick("moss", 0.35 + hash2(sx, sy, 30) * 0.3, sx, sy)
    let b = 0.6 + (hash2(seg, ring, 21) - 0.5) * 0.24
    b += fr < 0.25 ? 0.08 : fr > 0.72 ? -0.1 : 0
    if (ring === 9 || (ring === 11 && seg % 3 === 0)) b -= 0.28
    if (hash2(seg, ring, 31) > 0.9 && Math.abs(fr - fa + (hash2(seg, ring, 32) - 0.5) * 0.3) < 0.07) b -= 0.3 // a crack
    const grime = vnoise(x, z, 0.5, 33)
    if (grime > 0.6) b -= (grime - 0.6) * 0.8
    if (hash2(sx, sy, 23) > 0.94) b -= 0.15
    return pick("sand", b, sx, sy, 0.4)
  }
  // roads
  const rd = roadD(x, z)
  if (rd < wob * 0.8) {
    const k = roadKind(x, z)
    if (k === 1) {
      // thin ice in the low places between the stones
      const ice = vnoise(x, z, 0.9, 111)
      if (ice > 0.84 && rd < -0.15) return hash2(sx >> 1, sy, 112) > 0.93 ? pick("frost", 0.95, sx, sy) : pick("frost", 0.4 + (ice - 0.84) * 2 + hash2(sx, sy, 113) * 0.08, sx, sy)
      // towards the edge the stones give out and the verge's earth and grass come in
      const edge = Math.max(0, (rd + 0.45) / 0.45)
      if (rd > -0.12) return cobble(x, z, sx, sy, 5, "stone", 0.5, 15, true, edge) // kerb
      // here and there in the middle too a few stones have gone, and grass grows in the hole
      const gone = vnoise(x, z, 0.85, 121) > 0.8 ? 0.45 + (vnoise(x, z, 0.85, 121) - 0.8) * 2 : 0
      return cobble(x, z, sx, sy, 3.3, "stone", 0.6, 11, true, Math.max(edge * 0.6, gone))
    }
    if (k === 3) return cobble(x, z, sx, sy, 2.2, "sand", 0.64, 13, false, Math.max(0, (rd + 0.4) / 0.4) * 0.6)
    // dirt road: packed lighter along the middle where feet go, uneven earth and pebbles to the
    // sides, grass reaching in at the edges. No drawn lines along it: at a distance they read as
    // stray stripes rather than ruts.
    const w = 0.9,
      dist = rd + w
    if (rd > -0.3) {
      const f = fringe(x, z, sx, sy, (rd + 0.3) * 2.2)
      if (f) return f
    }
    // grass creeping in: tufts down the crown between the wheel tracks, and tongues of it from the verge
    if (rd < -0.3 && rd > -0.75 && vnoise(x, z, 2.4, 64) > 0.66) {
      const f = fringe(x, z, sx, sy, 0.5 + (vnoise(x, z, 2.4, 64) - 0.66) * 1.5)
      if (f) return f
    }
    if (rd > -0.55 && vnoise(x, z, 0.9, 65) > 0.72) {
      const f = fringe(x, z, sx, sy, 0.7)
      if (f) return f
    }
    const worn = dist < 0.45 + (vnoise(x, z, 1.4, 63) - 0.5) * 0.3
    return dirt(x, z, sx, sy, worn ? 0.55 : 0.45)
  }
  if (rd < 0.3 + wob) {
    // the verge: worn bare in patches beside the road
    if (vnoise(x, z, 1.8, 55) > 0.45 + rd * 1.2) return dirt(x, z, sx, sy, 0.5)
  }
  const biome = layout().biome
  if (biome) return biomeColor(biome, x, z, sx, sy, h)
  // terrace
  if (inRect(x, z, layout().terrace) || inRect(x, z, layout().stairs)) {
    if (inRect(x, z, layout().stairs)) return cobble(x, z, sx, sy, 2, "sand", 0.7, 17, false)
    if (inRect(x, z, layout().graveyard)) return grass(x, z, sx, sy, "leaf2", 0.1)
    return grass(x, z, sx, sy, "grass", 0.08)
  }
  for (const f of layout().fields)
    if (inRect(x, z, f, wob * 0.5)) {
      const t = (f.axis === "x" ? z : x) * 3
      const ff = t - Math.floor(t)
      return dirt(x, z, sx, sy, ff < 0.45 ? 0.55 : ff < 0.6 ? 0.25 : 0.38)
    }
  if (inRect(x, z, layout().pigpen, wob)) {
    const puddle = vnoise(x, z, 1.4, 61) > 0.78
    if (puddle) return pick("water", 0.35 + (hash2(sx, sy, 3) > 0.9 ? 0.4 : 0), sx, sy)
    return dirt(x, z, sx, sy, 0.3, "mud")
  }
  for (const g of layout().gardens)
    if (inRect(x, z, g, wob * 0.3)) {
      const t = z * 2.5,
        ff = t - Math.floor(t)
      if (x - g.x0 < 0.15 || g.x1 - x < 0.15) return pick("wood", 0.5, sx, sy)
      return dirt(x, z, sx, sy, ff < 0.55 ? 0.5 : 0.22)
    }
  for (const [a, b, c, d] of layout().dirtPatches)
    if (inRect(x, z, { x0: a, z0: b, x1: c, z1: d }, wob * 1.5)) {
      if (hash2(sx >> 1, sy, 71) > 0.97) return pick("thatch", 0.7, sx, sy) // straw
      return dirt(x, z, sx, sy, 0.48)
    }
  if (inRect(x, z, layout().pasture)) return grass(x, z, sx, sy, "grass", 0.06)
  // fallen leaves blown into drifts
  if (vnoise(x, z, 0.7, 114) > 0.72 && hash2(sx >> 1, sy >> 1, 115) > 0.9) return pick("autumn", 0.3 + hash2(sx, sy, 116) * 0.6, sx, sy)
  // wilder outside town
  const town = Math.hypot((x - 19) / 20, (z - 26) / 19)
  if (town > 0.95 + wob) return grass(x, z, sx, sy, "wild", 0.02)
  return grass(x, z, sx, sy)
}

/** The ground of the fields outside town. */
function biomeColor(biome: string, x: number, z: number, sx: number, sy: number, h: number): RGB {
  // hoarfrost: the world is cold all year, so pale specks lie on everything in the open
  const frost = hash2(sx, sy, 81) > 0.996 - vnoise(x, z, 0.6, 82) * 0.008
  // a footpath: trodden bare in patches along its middle, the grass (or needles) beaten flat at its
  // sides; it comes and goes, as paths do where few feet pass
  const td = trailD(x, z) + (vnoise(x, z, 1.6, 121) - 0.5) * 0.35
  if (td < 0.3 && biome !== "dune") {
    const worn = vnoise(x, z, 0.9, 127)
    if (td < 0.13 + worn * 0.08 && worn > 0.3 && hash2(sx, sy, 128) > 0.12) return hash2(sx, sy, 122) > 0.95 ? lvl("stone", 1) : dirt(x, z, sx, sy, biome === "forest" ? 0.32 : 0.42)
    if (hash2(sx >> 1, sy >> 1, 123) > 0.55) return biome === "forest" ? lvl("needles", 1) : lvl("grass", 1)
  }
  // mud in the low wet places, a few small puddles in it skinned with ice
  if ((biome === "meadow" || biome === "forest") && vnoise(x, z, 0.85, 124) > 0.78) {
    const wet = vnoise(x, z, 2.6, 125)
    if (wet > 0.74) return hash2(sx, sy, 126) > 0.7 ? pick("frost", 0.55 + (wet - 0.74) * 1.5, sx, sy) : pick("water", 0.3, sx, sy)
    if (wet > 0.42) return dirt(x, z, sx, sy, 0.22 + (wet - 0.42) * 0.3, "mud")
  }
  if (biome === "meadow") {
    // hoarfrost in the hollows: pale tips on the grass, not specks everywhere
    if (frost && vnoise(x, z, 0.5, 85) > 0.55) return lvl("frost", 3)
    const v = vnoise(x, z, 0.35, 84)
    return v > 0.62 ? grass(x, z, sx, sy, "wild", 0.04) : grass(x, z, sx, sy, "grass", -0.02 + v * 0.08)
  }
  if (biome === "dune") {
    // red and white sand in bands, with wind ripples across them and frost on the lee sides
    const band = vnoise(x * 0.6, z * 0.6, 0.25, 85)
    const ripple = Math.sin((x * 0.92 + z * 0.38) * 9 + vnoise(x, z, 0.8, 86) * 6)
    let b = 0.44 + band * 0.2 + (ripple > 0.82 ? 0.08 : ripple < -0.86 ? -0.08 : 0)
    const lee = groundH(x + 0.3, z + 0.1) - h > 0.06
    if (lee && hash2(sx, sy, 87) > 0.7) return pick("frost", 0.55 + hash2(sx, sy, 88) * 0.3, sx, sy)
    if (vnoise(x, z, 0.5, 89) > 0.78 && hash2(sx >> 1, sy >> 2, 90) > 0.6) return pick("thatch", 0.35 + hash2(sx, sy, 91) * 0.3, sx, sy) // dry grass
    // the red and the white bleed into each other at the edges of the bands
    const white = band + (hash2(sx >> 1, sy >> 1, 103) - 0.5) * 0.12 + (vnoise(x, z, 1.6, 104) - 0.5) * 0.1 > 0.55
    return pick(white ? "sand" : "redsand", b, sx, sy)
  }
  if (biome === "coast") {
    if (h < WATER_LINE + 0.35) return pick("sand", 0.5 + vnoise(x, z, 3, 92) * 0.3 - (h < WATER_LINE + 0.1 ? 0.18 : 0), sx, sy)
    if (frost) return pick("frost", 0.6, sx, sy)
    const steep = Math.abs(groundH(x + 0.25, z) - h) + Math.abs(groundH(x, z + 0.25) - h) > 0.3
    if (steep) return pick("stone", 0.32 + vnoise(x, z, 2, 93) * 0.35, sx, sy)
    return grass(x, z, sx, sy, "wild", vnoise(x, z, 0.4, 94) * 0.06)
  }
  if (biome === "forest") {
    // the forest floor: fallen needles in strokes, moss in cushions, a few leaves blown in
    const v = vnoise(x, z, 0.45, 95)
    if (v > 0.58) {
      const ml = patchLevel(x, z, sx, sy, [2, 3], 1.1, 96)
      const t = stampAt(sx, sy, 7, 97, TUFTS, () => 0.55)
      return lvl("moss", t ? ml + Number(t) - 3 : ml)
    }
    // the moss reaches out over the needles in tufts, so its edge is ragged
    if (v > 0.5) {
      const t = stampAt(sx, sy, 6, 102, TUFTS, () => (v - 0.5) * 9)
      if (t) return lvl("moss", 2 + Number(t) - 3)
    }
    const nl = patchLevel(x, z, sx, sy, [1, 2, 2], 0.8, 99)
    const nd = stampAt(sx, sy, 4, 98, NEEDLES, () => 0.7)
    if (nd) return lvl("needles", nl + Number(nd) - 2)
    const lf = stampAt(sx, sy, 11, 100, LEAVES, () => (vnoise(x, z, 0.7, 101) > 0.55 ? 0.6 : 0.05))
    if (lf) return lvl("autumn", lf === "a" ? 3 : 2)
    return lvl("needles", nl)
  }
  // the pass: thin grass between stones, frost in the hollows
  const steep = Math.abs(groundH(x + 0.25, z) - h) + Math.abs(groundH(x, z + 0.25) - h) > 0.26
  if (steep) return pick("stone", 0.3 + vnoise(x, z, 2, 100) * 0.4, sx, sy)
  // frost lies in the hollows, thinning out at the edges into the grass
  const hollow = vnoise(x, z, 0.5, 101) - 0.66
  if (frost || hollow > (hash2(sx, sy, 105) - 0.3) * 0.12) return pick("frost", 0.16 + hash2(sx, sy, 102) * 0.22 + Math.min(0.12, hollow), sx, sy)
  return grass(x, z, sx, sy, "wild", -0.04)
}
const WATER_LINE = -0.95

/** Heights for the terrain mesh, at 4 vertices per tile. */
export function meshHeights(res: number): Float32Array {
  const n = N * res + 1
  const out = new Float32Array(n * n)
  const step = FR / res
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) out[j * n + i] = F.h[j * step * GRID_N + i * step]
  return out
}

export { smooth, fbm }
