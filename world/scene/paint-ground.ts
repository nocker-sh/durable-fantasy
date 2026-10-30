import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { N } from "#/world/scene/world"
import { PPU } from "#/world/scene/textures/palette"
import { paintRows } from "#/world/scene/paint-rows"

export function paintGround(): PixBuf {
  const S = N * PPU
  const buf = new PixBuf(S, S)
  paintRows(buf, 0, S)
  return buf
}
