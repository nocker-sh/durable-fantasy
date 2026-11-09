import { OUTLINE } from "#/world/scene/pix"
import { Rng } from "#/lib/engine/random"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { item } from "#/world/scene/helpers/goods/item"

/** One item centred on a size × size canvas with a dark outline, for inventory icons. */
export function goodIcon(kind: string, size = 24, seed = 7): PixBuf {
  const b = new PixBuf(size, size)
  item({ b: b, kind: kind, cx: size / 2 - 0.5, cy: size / 2 + (kind === "carrot" ? 1 : 0), rng: new Rng(seed) })
  b.outline(OUTLINE)
  return b
}
