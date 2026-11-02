import { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { downsamplePixelArt } from "#/lib/graphics/downsample-pixel-art"
import { FIG_DOT } from "#/world/scene/figure/display-scale"

const scratch: { ctx: CanvasRenderingContext2D | null } = { ctx: null }

/**
 * A drawn frame or strip of a person, shrunk by FIG_DOT to the world's one dot size, as pixel art:
 * the outline and the eyes are kept (lib/graphics/downsample-pixel-art.ts). The frames are drawn finer
 * for the portraits; only what stands in the world is shrunk.
 */
export function shrinkSprite(image: ImageBitmap): ImageData {
  const w = image.width,
    h = image.height
  scratch.ctx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })!
  const c = scratch.ctx
  if (c.canvas.width < w || c.canvas.height < h) {
    c.canvas.width = Math.max(w, c.canvas.width)
    c.canvas.height = Math.max(h, c.canvas.height)
  }
  c.clearRect(0, 0, w, h)
  c.drawImage(image, 0, 0)
  const src = new PixelBuffer(w, h)
  src.data.set(c.getImageData(0, 0, w, h).data)
  const out = downsamplePixelArt(src, FIG_DOT)
  return new ImageData(out.data, out.w, out.h)
}
