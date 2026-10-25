export type RGB = [number, number, number];

export function hex(s: string): RGB {
  const v = parseInt(s.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export class PixelBuffer {
  w: number;
  h: number;
  data: Uint8ClampedArray<ArrayBuffer>;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }
  set(x: number, y: number, c: RGB, a = 255) {
    x |= 0;
    y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
    this.data[i + 3] = a;
  }
  alpha(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.data[(y * this.w + x) * 4 + 3];
  }
  get(x: number, y: number): RGB {
    const i = (y * this.w + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2]];
  }
  rect(x0: number, y0: number, w: number, h: number, c: RGB) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(x, y, c);
  }
  fill(fn: (x: number, y: number) => RGB | null) {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const c = fn(x, y);
        if (c) this.set(x, y, c);
      }
  }
  blit(src: PixelBuffer, dx: number, dy: number, flip = false) {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const sx = flip ? src.w - 1 - x : x;
        const a = src.alpha(sx, y);
        if (a) this.set(dx + x, dy + y, src.get(sx, y), a);
      }
  }
  /** 1px dark outline around opaque pixels, darker-of-neighbour tint. */
  outline(color: RGB) {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.alpha(x, y)) continue;
        if (this.alpha(x - 1, y) || this.alpha(x + 1, y) || this.alpha(x, y - 1) || this.alpha(x, y + 1)) add.push(x, y);
      }
    for (let i = 0; i < add.length; i += 2) this.set(add[i], add[i + 1], color);
  }
}
