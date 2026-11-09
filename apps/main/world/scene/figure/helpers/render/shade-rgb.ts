import { RAMPS } from "#/world/scene/pix"
import { bayer } from "#/world/scene/bayer"
import type { RGB } from "#/lib/graphics/pixel-types"

type Props = {
  ramp: string
  b: number
  x: number
  y: number
  rr?: RGB[]
}

export const shadeRGB = (props: Props): RGB => {
  const r = props.rr ?? RAMPS[props.ramp] // a ramp name starting with 'h' means no dither
  const n = r.length
  // hair is cel shaded (no dither) so locks read as clean shapes
  const t = Math.min(1, Math.max(0, props.b)) * (n - 1) + (props.ramp[0] === "h" ? 0 : bayer(props.x, props.y) * 0.35)
  return r[Math.min(n - 1, Math.max(0, Math.round(t)))]
}
