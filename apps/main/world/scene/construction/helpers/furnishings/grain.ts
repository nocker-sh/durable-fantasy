import { hash2 } from "#/lib/engine/hash2"
import { pick } from "#/world/scene/pick"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { vnoise } from "#/lib/engine/vnoise"

/** Planks of the given wood (a palette ramp, scene/pix.ts), as scene/textures/wood.ts draws them. */
type Props = {
  ramp: string
  light: number
  seed: number
  vertical?: boolean
}

export function grain(props: Props): PixBuf {
  const vertical = props.vertical === undefined ? false : props.vertical

  const b = new PixBuf(32, 32)
  b.fill((x, y) => {
    const a = vertical ? x : y,
      o = vertical ? y : x
    const k = Math.floor(a / 8),
      f = a / 8 - k
    const v = { value: props.light + (hash2(k, 0, props.seed) - 0.5) * 0.18 + (vnoise({ x: o, y: k * 7, scale: 0.18, seed: props.seed }) - 0.5) * 0.14 }
    if (f > 0.85) v.value = props.light - 0.28
    if (hash2(o, k, props.seed + 9) > 0.975) v.value -= 0.18
    return pick({ ramp: props.ramp, b: v.value, x: x, y: y, dither: 0.4 })
  })
  return b
}
