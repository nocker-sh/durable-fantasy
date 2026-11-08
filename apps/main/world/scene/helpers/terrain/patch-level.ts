import { bayer } from "#/world/scene/bayer"
import { vnoise } from "#/lib/engine/vnoise"

/** Flat tones over broad patches: the level, with a checker of the next at the edge between two. */
type Props = {
  x: number
  z: number
  sx: number
  sy: number
  levels: number[]
  scale: number
  seed: number
}

export function patchLevel(props: Props): number {
  const v = vnoise({ x: props.x, y: props.z, scale: props.scale, seed: props.seed }) * 0.7 + vnoise({ x: props.x, y: props.z, scale: props.scale * 2.7, seed: props.seed + 1 }) * 0.3
  const t = v * props.levels.length
  const i = Math.min(props.levels.length - 1, Math.floor(t))
  const f = t - i
  // where one tone gives way to the next, an ordered dither fades it in over a few pixels
  if (i < props.levels.length - 1 && f > 0.55 && bayer(props.sx, props.sy) + 0.47 < (f - 0.55) / 0.45) return props.levels[i + 1]
  return props.levels[i]
}
