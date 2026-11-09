import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  x: number
  y: number
  scale: number
  seed: number
  /** the size of the repeating texture */
  w: number
  h: number
}

/** Value noise that meets itself at the edges of a w × h texture, so a repeated texture shows no seam. */
export function seamlessNoise(props: Props): number {
  const fx = props.x / props.w,
    fy = props.y / props.h
  const n = (dx: number, dy: number) => vnoise({ x: props.x - dx, y: props.y - dy, scale: props.scale, seed: props.seed })
  const v = n(0, 0) * (1 - fx) * (1 - fy) + n(props.w, 0) * fx * (1 - fy) + n(0, props.h) * (1 - fx) * fy + n(props.w, props.h) * fx * fy
  // the blend pulls the middle towards grey; spread it back out
  const spread = 1 / Math.sqrt((1 - fx) ** 2 + fx ** 2) / Math.sqrt((1 - fy) ** 2 + fy ** 2)
  return Math.max(0, Math.min(1, 0.5 + (v - 0.5) * spread))
}
