import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  light?: number
  plank?: number
  seed?: number
  size?: number
  vertical?: boolean
}

export function woodTex(props: Props): PixBuf {
  const light = props.light === undefined ? 0.55 : props.light
  const plank = props.plank === undefined ? 9 : props.plank
  const seed = props.seed === undefined ? 2 : props.seed
  const size = props.size === undefined ? 64 : props.size
  const vertical = props.vertical === undefined ? false : props.vertical

  const b = new PixBuf(size, size)
  b.fill((x, y) => {
    const a = vertical ? x : y,
      o = vertical ? y : x
    const k = Math.floor(a / plank),
      f = a / plank - k
    const v = { value: light + (hash2(k, 0, seed) - 0.5) * 0.2 }
    v.value += (vnoise({ x: o, y: k * 7, scale: 0.15, seed: seed }) - 0.5) * 0.15
    if (f > 0.8) v.value = light - 0.3
    if (hash2(o, k, seed + 9) > 0.97) v.value -= 0.2
    return pick({ ramp: "wood", b: v.value, x: x, y: y, dither: 0.4 })
  })
  return b
}
