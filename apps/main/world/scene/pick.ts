import type { RGB } from "#/lib/graphics/pixel-types"
import { RAMPS } from "#/world/scene/pix"
import { bayer } from "#/world/scene/bayer"

type Props = {
  ramp: string
  b: number
  x: number
  y: number
  dither?: number
}

export function pick(props: Props): RGB {
  const dither = props.dither === undefined ? 0.7 : props.dither

  const r = RAMPS[props.ramp]
  const n = r.length
  const t = Math.min(1, Math.max(0, props.b)) * (n - 1) + bayer(props.x, props.y) * dither
  return r[Math.min(n - 1, Math.max(0, Math.round(t)))]
}
