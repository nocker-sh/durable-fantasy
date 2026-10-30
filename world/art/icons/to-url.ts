import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"

export function toUrl(b: PixBuf): string {
  const canvas = document.createElement("canvas")
  canvas.width = b.w
  canvas.height = b.h
  canvas.getContext("2d")!.putImageData(new ImageData(b.data, b.w, b.h), 0, 0)
  return canvas.toDataURL()
}
