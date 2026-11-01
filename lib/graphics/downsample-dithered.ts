import { PixelBuffer } from "#/lib/graphics/pixel-buffer"

/** The 4×4 offsets an old console added before cutting colours down to five bits a channel. */
const DITHER = [-4, 0, -3, 1, 2, -2, 3, -1, -3, 1, -4, 0, 3, -1, 2, -2]

/**
 * Shrink a painted picture by a whole factor, each new pixel the average of the block it covers,
 * then cut every channel to five bits through the 4×4 dither, as textures were on early 3D consoles:
 * the detail of the painting survives as soft, chunky texels in a slightly banded colour.
 */
export function downsampleDithered(source: PixelBuffer, factor: number): PixelBuffer {
  const f = Math.max(1, Math.round(factor))
  const w = Math.max(1, Math.ceil(source.w / f)),
    h = Math.max(1, Math.ceil(source.h / f))
  const out = new PixelBuffer(w, h)
  const s = source.data,
    d = out.data
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        n = 0
      for (let yy = y * f; yy < Math.min(source.h, y * f + f); yy++)
        for (let xx = x * f; xx < Math.min(source.w, x * f + f); xx++) {
          const i = (yy * source.w + xx) * 4
          r += s[i]
          g += s[i + 1]
          b += s[i + 2]
          a += s[i + 3]
          n++
        }
      const o = DITHER[(y & 3) * 4 + (x & 3)]
      const cut = (v: number) => Math.max(0, Math.min(248, Math.floor((v / n + o) / 8) * 8)) * (255 / 248)
      const i = (y * w + x) * 4
      d[i] = cut(r)
      d[i + 1] = cut(g)
      d[i + 2] = cut(b)
      d[i + 3] = Math.round(a / n)
    }
  return out
}
