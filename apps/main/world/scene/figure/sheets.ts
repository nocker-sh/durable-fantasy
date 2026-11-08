import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { Anim } from "#/world/scene/figure/animation"

export type Sheet = {
  buf: PixBuf
  cols: number
  rows: Record<string, number>
  anims: Anim[]
}
