import { PixBuf, pick, hash2, vnoise, type RGB, bayer } from "../pix"
import { lvl } from "./palette.ts"

export function woodTex(light = 0.55, plank = 9, seed = 2, size = 64, vertical = false): PixBuf {
  const b = new PixBuf(size, size)
  b.fill((x, y) => {
    const a = vertical ? x : y,
      o = vertical ? y : x
    const k = Math.floor(a / plank),
      f = a / plank - k
    let v = light + (hash2(k, 0, seed) - 0.5) * 0.2
    v += (vnoise(o, k * 7, 0.15, seed) - 0.5) * 0.15
    if (f > 0.8) v = light - 0.3
    if (hash2(o, k, seed + 9) > 0.97) v -= 0.2
    return pick("wood", v, x, y, 0.4)
  })
  return b
}

/** A board wall: upright planks with dark gaps, grain, knots, and weathered grey at the foot. */
function boardWall(x: number, y: number, H: number, seed: number): RGB {
  const v = H - 1 - y
  const k = Math.floor(x / 7),
    f = x - k * 7
  if (f === 0) return lvl("board", 0)
  let l = 3 + (hash2(k, 0, seed) > 0.7 ? 1 : hash2(k, 0, seed) < 0.2 ? -1 : 0)
  if (f === 1) l += 1
  if (hash2(k, y >> 3, seed + 2) > 0.8 && (y & 7) === 3) l -= 1 // grain
  if (hash2(x >> 1, y >> 1, seed + 4) > 0.985) l -= 2 // a knot
  if (v < 12 && bayer(x, y) + 0.47 < (12 - v) / 14) return lvl("stone", 2) // greyed by the wet
  return lvl("board", l)
}

export { boardWall }
