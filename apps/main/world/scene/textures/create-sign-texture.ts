import { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { SIGN_PAINTERS } from "#/world/scene/textures/signs/sign-painters"

/** Keep the common wooden board independent of its emblem; unknown kinds retain the blank board. */
export function createSignTexture(kind: string): PixelBuffer {
  const buffer = new PixelBuffer(24, 18)
  buffer.fill((x, y) => {
    const edge = x === 0 || y === 0 || x === 23 || y === 17
    return pick({ ramp: "wood", b: edge ? 0.25 : 0.62 + (y % 4 === 0 ? -0.15 : 0), x, y, dither: 0.3 })
  })
  SIGN_PAINTERS.get(kind)?.(buffer)
  return buffer
}
