import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  ramp: string
  light: number
  noise?: number
  seed?: number
  size?: number
}

export function plainTex(props: Props): PixBuf {
  const noise = props.noise === undefined ? 0.12 : props.noise
  const seed = props.seed === undefined ? 6 : props.seed
  const size = props.size === undefined ? 64 : props.size

  const b = new PixBuf(size, size)
  b.fill((x, y) => pick({ ramp: props.ramp, b: props.light + (vnoise({ x: x, y: y, scale: 0.1, seed: seed }) - 0.5) * noise + (hash2(x, y, seed) - 0.5) * noise * 0.5, x: x, y: y }))
  return b
}
