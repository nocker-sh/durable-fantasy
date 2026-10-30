import { bayer } from "#/world/scene/bayer"
import type { RGB } from "#/lib/graphics/pixel-types"

type Props = {
  ramp: RGB[]
  l: number
  x: number
  y: number
}

export function shade(props: Props): RGB {
  const n = props.ramp.length
  const t = Math.min(1, Math.max(0, props.l)) * (n - 1) + bayer(props.x, props.y) * 0.6
  return props.ramp[Math.min(n - 1, Math.max(0, Math.round(t)))]
}
