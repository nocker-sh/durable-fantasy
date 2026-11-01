import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "#/lib/engine/hash2"
import { seamlessNoise } from "#/world/scene/textures/seamless-noise"
import { ToneMap } from "#/world/scene/textures/tone-map"

type Props = {
  light?: number
  plank?: number
  seed?: number
  size?: number
  vertical?: boolean
}

/** Planks painted soft: each plank its own tone, a soft dark gap, the grain laid in strokes along it. */
export function woodTex(props: Props): PixBuf {
  const light = props.light === undefined ? 0.55 : props.light
  const seed = props.seed === undefined ? 2 : props.seed
  const size = props.size === undefined ? 128 : props.size
  // plank widths are given for a 64-pixel texture; a larger one paints the same planks finer
  const fine = size / 64
  const vertical = props.vertical === undefined ? false : props.vertical
  const planks = Math.max(1, Math.round(size / ((props.plank === undefined ? 9 : props.plank) * fine)))
  const plank = size / planks

  const top = RAMPS.wood.length - 1
  const t = new ToneMap(size, size)
  t.fill((x, y) => {
    const a = vertical ? x : y
    const k = Math.floor(a / plank),
      f = a / plank - k
    const wash = seamlessNoise({ x: x, y: y, scale: 0.08 / fine, seed: seed, w: size, h: size })
    const l = { value: light * top + (hash2(k, 0, seed) - 0.5) * 0.8 + (wash - 0.5) * 0.7 }
    if (f > 0.84) return { ramp: "wood", level: l.value - 1.2, region: -1 }
    if (f < 0.16) l.value += 0.5
    return { ramp: "wood", level: l.value, region: k }
  })
  t.strokes({ seed: seed, density: 0.14, along: vertical ? "y" : "x", len: [3, 7], thick: [1, 1], step: 0.5, bleed: 0.03, wrap: true })
  return t.paint(0.15)
}
