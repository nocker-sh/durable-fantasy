import { PixelBuffer as PixBuf } from "../../../lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "../../../lib/engine/hash2"
import { lvl } from "./palette"

/**
 * Foliage as pixel art: little clusters of leaves (each lit at the upper left, shadowed below)
 * packed on a jittered grid over the dark of the deeper leaves, a bright sunlit leaf here and
 * there. The cells wrap, so the tile repeats without a seam.
 */
const LEAF_SHAPES: readonly string[][] = [
  [".45.", "4443", "3332", ".21."],
  ["..4.", ".443", "4332", "321."],
  [".44..", "44433", ".3322", "..21."],
  ["4.", "43", "32"],
]

export function leafTex(ramp = "leaf", seed = 5, size = 64): PixBuf {
  const b = new PixBuf(size, size)
  const n = RAMPS[ramp].length,
    shift = n >= 6 ? 0 : -1
  const cell = 8,
    cells = size / cell
  b.fill((x, y) => {
    const cx = Math.floor(x / cell),
      cy = Math.floor(y / cell)
    for (let oy = 0; oy >= -1; oy--)
      for (let ox = 0; ox >= -1; ox--) {
        const gx = (cx + ox + cells) % cells,
          gy = (cy + oy + cells) % cells
        for (let k = 0; k < 4; k++) {
          const px = (cx + ox) * cell + Math.floor(hash2(gx, gy * 4 + k, seed + 2) * 6),
            py = (cy + oy) * cell + Math.floor(hash2(gx, gy * 4 + k, seed + 3) * 6)
          const st = LEAF_SHAPES[Math.min(LEAF_SHAPES.length - 1, Math.floor(hash2(gx, gy * 4 + k, seed + 1) * LEAF_SHAPES.length))]
          const lx = x - px,
            ly = y - py
          if (lx < 0 || ly < 0 || ly >= st.length || lx >= st[ly].length || st[ly][lx] === ".") continue
          let l = Number(st[ly][lx]) + shift
          if (l >= 4 + shift && hash2(gx, gy * 4 + k, seed + 4) > 0.85) l += 1 // a leaf the sun catches
          return lvl(ramp, l)
        }
      }
    // the deeper leaves between
    return lvl(ramp, (hash2(x >> 2, y >> 2, seed + 6) > 0.5 ? 2 : 1) + shift)
  })
  return b
}
