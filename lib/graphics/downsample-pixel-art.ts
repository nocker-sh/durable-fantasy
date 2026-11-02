import { PixelBuffer } from "#/lib/graphics/pixel-buffer"

const lum = (d: Uint8ClampedArray, i: number) => d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15

/** How much darker than the rest of its block a lone pixel must be to be kept as a detail (an eye, a button). */
const DETAIL = 36

/**
 * Shrink a cut-out pixel-art picture (a person, drawn with a dark outline) by a whole factor without
 * blurring it into mud. Averaging would grey the outline and wash the eyes out of the face, so each new
 * pixel keeps one of the colours already drawn in its block:
 * - a lone dark pixel on an even patch (an eye, a button) wins, so small details survive;
 * - otherwise the colour drawn most often wins, the lighter one on a tie, so faces under a fringe stay skin;
 * - the outline is left out of that choice and drawn again round the shrunk shape, one pixel wide.
 * A pixel is there when at least half of its block was.
 */
export function downsamplePixelArt(source: PixelBuffer, factor: number): PixelBuffer {
  const f = Math.max(1, Math.round(factor))
  const sw = source.w,
    sh = source.h,
    s = source.data
  const w = Math.max(1, Math.ceil(sw / f)),
    h = Math.max(1, Math.ceil(sh / f))
  const out = new PixelBuffer(w, h)
  const d = out.data
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < sw && y < sh && s[(y * sw + x) * 4 + 3] >= 128
  // the drawn outline: a solid pixel with an empty one beside it
  const edge = (x: number, y: number) => !solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1)
  const inner: number[] = [],
    rim: number[] = [],
    count = new Map<number, number>()
  const block = (bx: number, by: number) => {
    inner.length = 0
    rim.length = 0
    for (let y = by * f; y < Math.min(sh, by * f + f); y++) for (let x = bx * f; x < Math.min(sw, bx * f + f); x++) if (solid(x, y)) (edge(x, y) ? rim : inner).push((y * sw + x) * 4)
  }
  const choose = (pool: readonly number[]): number => {
    let dark = pool[0]
    for (const i of pool) if (lum(s, i) < lum(s, dark)) dark = i
    if (pool.length > 1) {
      let lo = Infinity,
        hi = -Infinity
      for (const i of pool) {
        if (i === dark) continue
        lo = Math.min(lo, lum(s, i))
        hi = Math.max(hi, lum(s, i))
      }
      if (lo - lum(s, dark) >= DETAIL && hi - lo < DETAIL / 2) return dark
    }
    count.clear()
    for (const i of pool) {
      const key = (s[i] << 16) | (s[i + 1] << 8) | s[i + 2]
      count.set(key, (count.get(key) ?? 0) + 1)
    }
    let best = pool[0],
      most = 0
    for (const i of pool) {
      const n = count.get((s[i] << 16) | (s[i + 1] << 8) | s[i + 2])!
      if (n > most || (n === most && lum(s, i) > lum(s, best))) {
        best = i
        most = n
      }
    }
    return best
  }
  const put = (x: number, y: number, i: number) => {
    const o = (y * w + x) * 4
    d[o] = s[i]
    d[o + 1] = s[i + 1]
    d[o + 2] = s[i + 2]
    d[o + 3] = 255
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      block(x, y)
      if ((inner.length + rim.length) * 2 < f * f) continue
      put(x, y, choose(inner.length ? inner : rim))
    }
  // the outline again, round the shrunk shape: its darkest outline colour from the block
  const there = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!there(x, y) || (there(x - 1, y) && there(x + 1, y) && there(x, y - 1) && there(x, y + 1))) continue
      block(x, y)
      if (!rim.length) continue
      let dark = rim[0]
      for (const i of rim) if (lum(s, i) < lum(s, dark)) dark = i
      put(x, y, dark)
    }
  return out
}
