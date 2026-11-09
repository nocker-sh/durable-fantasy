import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"

export function crop(b: PixBuf, margin: number): PixBuf {
  const x0 = { value: b.w },
    y0 = { value: b.h },
    x1 = { value: -1 },
    y1 = { value: -1 }
  for (const y = { value: 0 }; y.value < b.h; y.value++)
    for (const x = { value: 0 }; x.value < b.w; x.value++) {
      if (!b.alpha(x.value, y.value)) continue
      x0.value = Math.min(x0.value, x.value)
      x1.value = Math.max(x1.value, x.value)
      y0.value = Math.min(y0.value, y.value)
      y1.value = Math.max(y1.value, y.value)
    }
  if (x1.value < 0) return b
  const out = new PixBuf(x1.value - x0.value + 1 + margin * 2, y1.value - y0.value + 1 + margin * 2)
  for (const y = { value: y0.value }; y.value <= y1.value; y.value++)
    for (const x = { value: x0.value }; x.value <= x1.value; x.value++)
      if (b.alpha(x.value, y.value)) out.set({ x: x.value - x0.value + margin, y: y.value - y0.value + margin, color: b.get(x.value, y.value), alpha: b.alpha(x.value, y.value) })
  return out
}
