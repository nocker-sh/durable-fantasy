import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "#/lib/engine/hash2"
import { seamlessNoise } from "#/world/scene/textures/seamless-noise"
import { ToneMap } from "#/world/scene/textures/tone-map"

type Props = {
  ramp?: string
  light?: number
  seed?: number
  bw?: number
  bh?: number
  size?: number
}

/**
 * Laid stone painted soft: blocks with rounded corners, lit on their upper left and shading to
 * the lower right, their tones drifting in broad washes; mortar only a little darker than the
 * stone, so the courses read without drawing a hard grid.
 */
export function stoneTex(props: Props): PixBuf {
  const ramp = props.ramp === undefined ? "stone" : props.ramp
  const light = props.light === undefined ? 0.55 : props.light
  const seed = props.seed === undefined ? 1 : props.seed
  const size = props.size === undefined ? 256 : props.size
  // block sizes are given for a 128-pixel texture; a larger one paints the same blocks finer
  const k = size / 128
  // whole blocks across and down the texture, so it repeats without a seam
  const cols = Math.max(1, Math.round(size / ((props.bw === undefined ? 20 : props.bw) * k))),
    rows = Math.max(1, Math.round(size / ((props.bh === undefined ? 11 : props.bh) * k)))
  const bw = size / cols,
    bh = size / rows

  const base = light * (RAMPS[ramp].length - 1)
  const t = new ToneMap(size, size)
  t.fill((x, y) => {
    const row = Math.floor(y / bh)
    const uu = x / bw + (row % 2) * 0.5
    const c = Math.floor(uu)
    const fu = uu - c,
      fv = y / bh - row
    const wash = seamlessNoise({ x: x, y: y, scale: 0.05 / k, seed: seed + 3, w: size, h: size })
    const cu = Math.min(fu, 1 - fu) * bw,
      cv = Math.min(fv, 1 - fv) * bh
    const corner = cu < 2 * k && cv < 2 * k && Math.hypot(2 * k - cu, 2 * k - cv) > 2 * k
    if (fu * bw < k * 1.2 || fv > 0.88 || corner) return { ramp: ramp, level: base - 1.1 + (wash - 0.5) * 0.5, region: -1 }
    const l = { value: base + (hash2(c % cols, row, seed) - 0.5) * 0.8 + (wash - 0.5) * 0.8 }
    if (fv < 0.2 || fu < 0.1) l.value += 0.5
    else if (fv > 0.72 || fu > 0.9) l.value -= 0.5
    return { ramp: ramp, level: l.value, region: (c % cols) * 64 + row }
  })
  t.strokes({ seed: seed, density: 0.12, along: "x", len: [2, 4], thick: [1, 2], step: 0.5, bleed: 0.05, wrap: true })
  return t.paint(0.15)
}
