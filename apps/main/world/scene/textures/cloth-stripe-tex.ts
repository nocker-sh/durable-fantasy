import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { vnoise } from "#/lib/engine/vnoise"

export function clothStripeTex(a: string, c: string, seed = 7): PixBuf {
  const b = new PixBuf(32, 32)
  b.fill((x, y) => {
    const stripe = Math.floor(x / 4) % 2 === 0
    const v = { value: 0.62 + (vnoise({ x: x, y: y, scale: 0.15, seed: seed }) - 0.5) * 0.2 - (y > 26 ? 0.15 : 0) }
    if (y > 28 && x % 4 === 0) return null
    return pick({ ramp: stripe ? a : c, b: v.value, x: x, y: y })
  })
  return b
}
