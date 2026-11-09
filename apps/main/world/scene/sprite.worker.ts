// Renders villager sprite frames off the main thread, one frame per message. The frame goes back
// as an ImageBitmap (transferred) with a PNG of it for the page to keep in IndexedDB.
import { ANIMS } from "#/world/scene/figure/animation"
import { FH, FW } from "#/world/scene/figure/render"
import { renderFrame } from "#/world/scene/figure/render-frame"
import type { AnimSpec, Anim } from "#/world/scene/figure/animation"
import type { Item, Look } from "#/world/scene/figure/look"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"

export type FrameJob = {
  key: string
  look: Look
  anim: string
  spec: AnimSpec
  item: Item
  view: number
  f: number
}
export type FrameDone = {
  key: string
  bitmap: ImageBitmap
  png: Blob | null
}

export type FrameFailed = {
  key: string
  failed: true
}
export type FrameResult = FrameDone | FrameFailed

const canvas = new OffscreenCanvas(FW, FH)
const ctx = canvas.getContext("2d")!

self.onmessage = async (event: MessageEvent<FrameJob>) => {
  const job = event.data
  try {
    // Clips registered by the studio are not in this worker's animation table yet.
    ANIMS[job.anim as Anim] ??= job.spec
    const buf = new PixBuf(FW, FH)
    renderFrame({ L: job.look, anim: job.anim as Anim, f: job.f, view: job.view, item: job.item, out: buf, ox: 0, oy: 0 })
    ctx.clearRect(0, 0, FW, FH)
    ctx.putImageData(new ImageData(buf.data, FW, FH), 0, 0)
    // Persistence is optional: an encoding failure must not discard a rendered frame.
    const png = await canvas.convertToBlob({ type: "image/png" }).catch(() => null)
    const bitmap = canvas.transferToImageBitmap()
    const done: FrameDone = { key: job.key, bitmap, png }
    ;(self as unknown as Worker).postMessage(done, [bitmap])
  } catch {
    const failed: FrameFailed = { key: job.key, failed: true }
    ;(self as unknown as Worker).postMessage(failed)
  }
}
