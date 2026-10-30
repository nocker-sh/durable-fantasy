import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"

/** Scale up by the largest whole factor that keeps it within `limit` pixels. */
export function enlarge(b: PixBuf, limit: number): PixBuf {
  const k = Math.max(1, Math.floor(limit / Math.max(b.w, b.h)))
  if (k === 1) return b
  const out = new PixBuf(b.w * k, b.h * k)
  for (const y = { value: 0 }; y.value < out.h; y.value++)
    for (const x = { value: 0 }; x.value < out.w; x.value++) {
      const sx = Math.floor(x.value / k),
        sy = Math.floor(y.value / k)
      if (b.alpha(sx, sy)) out.set({ x: x.value, y: y.value, color: b.get(sx, sy), alpha: b.alpha(sx, sy) })
    }
  return out
}
