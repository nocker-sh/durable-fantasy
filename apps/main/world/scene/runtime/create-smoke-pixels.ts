import { PixelBuffer } from "#/lib/graphics/pixel-buffer"

/** 煙の元の二色と透明な角を保ち、拡大時にぼかさない画素を作る。 */
export function createSmokePixels(): PixelBuffer {
  const pixels = new PixelBuffer(12, 12)
  pixels.fill((x, y) => {
    const distance = Math.hypot(x - 5.5, y - 5.5)
    if (distance >= 5.5) return null
    if (distance < 3 && x < 6 && y < 6) return [214, 206, 200]
    return [168, 162, 166]
  })
  return pixels
}
