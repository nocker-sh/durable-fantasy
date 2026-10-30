import type { RGB } from "#/lib/graphics/pixel-types"

/** Fixed-size RGBA storage, shared with textures and transferable to rendering workers. */
export class PixelBuffer {
  readonly w: number
  readonly h: number
  readonly data: Uint8ClampedArray<ArrayBuffer>
  constructor(w: number, h: number) {
    this.w = w
    this.h = h
    this.data = new Uint8ClampedArray(w * h * 4)
    Object.freeze(this)
  }
  set(inputProps: { x: number; y: number; color: RGB; alpha?: number }) {
    const x = inputProps.x | 0
    const y = inputProps.y | 0
    const c = inputProps.color
    const a = inputProps.alpha === undefined ? 255 : inputProps.alpha

    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const i = (y * this.w + x) * 4
    this.data[i] = c[0]
    this.data[i + 1] = c[1]
    this.data[i + 2] = c[2]
    this.data[i + 3] = a
  }
  alpha(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0
    return this.data[(y * this.w + x) * 4 + 3]
  }
  get(x: number, y: number): RGB {
    const i = (y * this.w + x) * 4
    return [this.data[i], this.data[i + 1], this.data[i + 2]]
  }
  rect(inputProps: { x: number; y: number; width: number; height: number; color: RGB }) {
    const x0 = inputProps.x
    const y0 = inputProps.y
    const w = inputProps.width
    const h = inputProps.height
    const c = inputProps.color

    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set({ x: x, y: y, color: c })
  }
  fill(fn: (x: number, y: number) => RGB | null) {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const c = fn(x, y)
        if (c) this.set({ x: x, y: y, color: c })
      }
  }
  blit(inputProps: { source: PixelBuffer; x: number; y: number; flip?: boolean }) {
    const src = inputProps.source
    const dx = inputProps.x
    const dy = inputProps.y
    const flip = inputProps.flip === undefined ? false : inputProps.flip

    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const sx = flip ? src.w - 1 - x : x
        const a = src.alpha(sx, y)
        if (a) this.set({ x: dx + x, y: dy + y, color: src.get(sx, y), alpha: a })
      }
  }
  /** 1px dark outline around opaque pixels, darker-of-neighbour tint. */
  outline(color: RGB) {
    const add: number[] = []
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.alpha(x, y)) continue
        if (this.alpha(x - 1, y) || this.alpha(x + 1, y) || this.alpha(x, y - 1) || this.alpha(x, y + 1)) add.push(x, y)
      }
    for (let i = 0; i < add.length; i += 2) this.set({ x: add[i], y: add[i + 1], color: color })
  }
}
