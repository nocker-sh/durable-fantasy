import { PixBuf, hash2, vnoise, RAMPS, bayer } from "../pix"
import { lvl } from "./palette.ts"

/**
 * Roof tiles as pixel art, old and weathered: each tile its own tone with a soft unevenness across
 * it, lit along its top, the tile above's shadow along its foot, a dark joint at its side; corners
 * chipped off, the odd tile cracked or slipped darker, pale lichen spots, moss in clumps where the
 * roof stays damp and creeping along the joints.
 */
export function roofTex(ramp = "roof", light = 0.6, seed = 3, size = 128): PixBuf {
  const b = new PixBuf(size, size)
  const n = RAMPS[ramp].length,
    base = Math.round(light * (n - 1))
  b.fill((x, y) => {
    const row = Math.floor(y / 10)
    const fv = y / 10 - row
    const uu = x / 12.8 + (row % 2) * 0.5
    const c = Math.floor(uu)
    const fu = uu - c
    const h = hash2(c % 10, row, seed)
    let l = base + (h > 0.84 ? 1 : h < 0.12 ? -1 : 0)
    if (hash2(c % 10, row, seed + 21) > 0.93) l -= 1 // a slipped tile, in shadow
    const damp = vnoise(x, y, 0.05, seed + 5)
    if (fv > 0.8) return damp > 0.62 && hash2(x, y, seed + 22) > 0.4 ? lvl("moss", 2) : lvl(ramp, base - 2) // the tile above's shadow
    if (fu < 0.08) return damp > 0.58 && hash2(x, y, seed + 23) > 0.5 ? lvl("moss", 2) : lvl(ramp, l - 1) // joint
    // a corner knocked off: the shadow of the tile beneath shows through
    if (hash2(c % 10, row, seed + 24) > 0.8 && fu > 0.82 && fv > 0.55) return lvl(ramp, base - 2)
    if (fv < 0.2 && fu > 0.15 && fu < 0.85) l += 1 // lit top edge
    // unevenness across the tile, in a dither
    if (bayer(x, y) + 0.47 < (vnoise(x, y, 0.3, seed + 25) - 0.55) * 2.5) l -= 1
    // a crack running down the odd tile
    if (hash2(c % 10, row, seed + 26) > 0.92 && Math.abs(fu - 0.4 - fv * 0.2) < 0.04) return lvl(ramp, l - 2)
    // moss in clumps on the damp tiles, and pale lichen spots on the dry ones
    if (damp > 0.66 && hash2(c % 10, row, seed + 9) > 0.45 && fv > 0.3 && Math.hypot(fu - 0.5, (fv - 0.55) * 1.4) < 0.32) return lvl("moss", 3 + (fv < 0.45 ? 1 : 0) - (hash2(x, y, 27) > 0.7 ? 1 : 0))
    if (damp < 0.4 && hash2(x >> 1, y >> 1, seed + 28) > 0.97) return lvl("frost", 3)
    return lvl(ramp, l)
  })
  return b
}

/**
 * Thatch as pixel art: layers of straw bundles, each layer a band of strands (thin strokes, lit at
 * the top), its foot a ragged line of strand ends over the shadow on the layer below.
 */
export function thatchTex(seed = 4, size = 128): PixBuf {
  const b = new PixBuf(size, size)
  b.fill((x, y) => {
    const row = Math.floor(y / 14),
      fv = y / 14 - row
    // strand ends hang to different lengths: the layer's ragged foot
    const end = 0.78 + hash2(x, row, seed + 2) * 0.16
    if (fv > end) return lvl("thatch", 1)
    const strand = hash2(x, row, seed)
    let l = 3 + (strand > 0.75 ? 1 : strand < 0.2 ? -1 : 0)
    if (fv < 0.18) l += 1 // the lit top of the layer
    if (fv > end - 0.12) l -= 1 // shading just above the ends
    // a darker, older patch here and there
    if (vnoise(x, y, 0.06, seed + 7) > 0.7) l -= 1
    return lvl("thatch", l)
  })
  return b
}
