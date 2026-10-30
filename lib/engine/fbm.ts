import { vnoise } from "./vnoise"
import type { NoiseInput as Props } from "./noise-types"

export function fbm(props: Props): number {
  return (
    vnoise(props) * 0.55 +
    vnoise({ x: props.x, y: props.y, scale: props.scale * 2.3, seed: props.seed + 1 }) * 0.3 +
    vnoise({ x: props.x, y: props.y, scale: props.scale * 5.1, seed: props.seed + 2 }) * 0.15
  )
}
