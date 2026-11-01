import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"

type Strokes = {
  seed: number
  /** strokes laid per pixel */
  density: number
  /** the way a stroke runs: along the courses of a roof, or down the boards and straw */
  along: "x" | "y"
  len: [number, number]
  thick: [number, number]
  /** how far a stroke's tone sits from the tone where it starts, in ramp levels */
  step: number
  /** the share of strokes that may cross into the next tile, plank or stone */
  bleed?: number
  /** the texture repeats: strokes run off one edge and back in at the other */
  wrap?: boolean
}

const colours = new Map<string, RGB>()

/** A ramp's colour at a fractional level, rounded to half steps and drawn a little towards grey. */
const soft = (ramp: string, level: number, mute: number): RGB => {
  const r = RAMPS[ramp]
  const l = Math.max(0, Math.min(r.length - 1, Math.round(level * 2) / 2))
  const key = `${ramp}|${l}|${mute}`
  const hit = colours.get(key)
  if (hit) return hit
  const a = r[Math.floor(l)],
    b = r[Math.ceil(l)],
    f = l - Math.floor(l)
  const c = [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * f)
  const grey = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15
  const out: RGB = [Math.round(c[0] + (grey - c[0]) * mute), Math.round(c[1] + (grey - c[1]) * mute), Math.round(c[2] + (grey - c[2]) * mute)]
  colours.set(key, out)
  return out
}

/**
 * A texture painted the way the meadows are (open-biome の painterly-pixel-terrain): first each
 * pixel gets a ramp, a fractional level and the tile, plank or stone it belongs to; then short
 * strokes a level apart are laid over it inside each piece, so that the colours gather into
 * clumps like brush marks instead of a per-pixel noise; last the levels become colours from a
 * few close, slightly muted steps.
 */
export class ToneMap {
  readonly w: number
  readonly h: number
  readonly level: Float32Array
  readonly region: Int32Array
  readonly ramp: Uint8Array
  readonly ramps: string[] = []
  constructor(w: number, h: number) {
    this.w = w
    this.h = h
    this.level = new Float32Array(w * h)
    this.region = new Int32Array(w * h)
    this.ramp = new Uint8Array(w * h)
  }
  rampId(name: string): number {
    const k = this.ramps.indexOf(name)
    if (k >= 0) return k
    this.ramps.push(name)
    return this.ramps.length - 1
  }
  /** Fill every pixel from what `at` says of it. */
  fill(at: (x: number, y: number) => { ramp: string; level: number; region?: number }) {
    for (const y = { value: 0 }; y.value < this.h; y.value++)
      for (const x = { value: 0 }; x.value < this.w; x.value++) {
        const s = at(x.value, y.value)
        const i = y.value * this.w + x.value
        this.ramp[i] = this.rampId(s.ramp)
        this.level[i] = s.level
        this.region[i] = s.region ?? 0
      }
  }
  strokes(o: Strokes) {
    const rng = new Rng(o.seed * 7919 + 13)
    const bleed = o.bleed ?? 0.1
    const count = Math.round(this.w * this.h * o.density)
    for (const k = { value: 0 }; k.value < count; k.value++) {
      const cx = rng.int(this.w),
        cy = rng.int(this.h)
      const c = cy * this.w + cx
      const along = o.len[0] + rng.next() * (o.len[1] - o.len[0]),
        across = o.thick[0] + rng.next() * (o.thick[1] - o.thick[0])
      const rx = (o.along === "x" ? along : across) / 2,
        ry = (o.along === "x" ? across : along) / 2
      const tone = this.level[c] + (rng.next() < 0.5 ? -o.step : o.step)
      const spill = rng.next() < bleed
      for (const dy = { value: -Math.ceil(ry) }; dy.value <= Math.ceil(ry); dy.value++)
        for (const dx = { value: -Math.ceil(rx) }; dx.value <= Math.ceil(rx); dx.value++) {
          if ((dx.value / Math.max(0.5, rx)) ** 2 + (dy.value / Math.max(0.5, ry)) ** 2 > 1) continue
          const x = { value: cx + dx.value },
            y = { value: cy + dy.value }
          if (o.wrap) {
            x.value = (x.value + this.w) % this.w
            y.value = (y.value + this.h) % this.h
          } else if (x.value < 0 || y.value < 0 || x.value >= this.w || y.value >= this.h) continue
          const i = y.value * this.w + x.value
          if (this.ramp[i] !== this.ramp[c]) continue
          if (!spill && this.region[i] !== this.region[c]) continue
          // a stroke keeps the shading it is laid over: it only moves the tone by its own step
          this.level[i] = Math.abs(this.level[i] - tone) <= o.step * 1.6 ? tone : this.level[i]
        }
    }
  }
  /** The colour of one pixel as it stands. */
  colour(x: number, y: number, mute = 0.2): RGB {
    const i = y * this.w + x
    return soft(this.ramps[this.ramp[i]], this.level[i], mute)
  }
  /** Write the colours into a pixel buffer of the same size (a new one when none is given). */
  paint(mute = 0.2, into?: PixBuf): PixBuf {
    const b = into ?? new PixBuf(this.w, this.h)
    for (const y = { value: 0 }; y.value < this.h; y.value++) for (const x = { value: 0 }; x.value < this.w; x.value++) b.set({ x: x.value, y: y.value, color: this.colour(x.value, y.value, mute) })
    return b
  }
}
