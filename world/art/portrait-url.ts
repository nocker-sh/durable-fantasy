import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { FH, FW } from "#/world/scene/figure/render"
import type { Look } from "#/world/scene/figure/look"
import { spriteFrame } from "#/world/scene/sprite-frame"
import { crop } from "#/world/art/icons/crop"
import { toUrl } from "#/world/art/icons/to-url"

/** The character standing and facing the viewer, cropped to the figure; drawn by a sprite worker. */
export function portraitUrl(look: Look, ready: (url: string) => void) {
  const shown = { ...look, hat: look.hat === "helm" || look.hat === "greathelm" ? look.hat : undefined }
  const done = (bitmap: ImageBitmap) => {
    const canvas = new OffscreenCanvas(FW, FH)
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(bitmap, 0, 0)
    const frame = new PixBuf(FW, FH)
    frame.data.set(ctx.getImageData(0, 0, FW, FH).data)
    ready(toUrl(crop(frame, 1)))
  }
  const data = spriteFrame({ look: shown, item: null, anim: "idle", view: 0, f: 0, urgency: 900, onReady: done })
  if (data) done(data)
}
