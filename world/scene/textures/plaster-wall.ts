import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  x: number
  y: number
  H: number
  seed: number
  ramp: string
  /** the ramp level the plaster sits at */
  top: number
}

/**
 * One pixel of plaster, as a tone to paint: broad soft washes of a lighter and a darker tone,
 * grime rising from the ground and a shadow under the eaves each fading in smoothly, faint damp
 * patches, the odd rain streak and hairline crack. Plaster is one region; strokes run across it.
 */
export function plasterWall(props: Props): { ramp: string; level: number; region: number } {
  const v = props.H - 1 - props.y
  const wash = vnoise({ x: props.x, y: props.y, scale: 0.04, seed: props.seed })
  const fine = vnoise({ x: props.x, y: props.y, scale: 0.11, seed: props.seed + 10 })
  const l = { value: props.top + (wash - 0.5) * 1.1 + (fine - 0.5) * 0.4 }
  l.value -= Math.max(0, (14 - v) / 14) ** 1.5 * 1.1 // grime at the foot
  l.value -= Math.max(0, (v - (props.H - 12)) / 12) ** 1.5 * 1.2 // shadow under the eaves
  // a faint rain streak running down from the top
  if (hash2(props.x >> 1, 0, props.seed + 2) > 0.93 && v > props.H * 0.4 && hash2(props.x, props.y >> 3, props.seed + 3) > 0.3) l.value -= 0.5
  // hairline cracks: a short stepped line, now and then
  const cx = Math.floor(props.x / 29),
    cy = Math.floor(props.y / 23)
  if (hash2(cx, cy, props.seed + 6) > 0.9) {
    const lx = props.x - cx * 29 - 8,
      ly = props.y - cy * 23 - 6
    if (lx >= 0 && lx < 7 && ly === Math.floor(lx * 0.7)) l.value -= 1
  }
  return { ramp: props.ramp, level: l.value, region: 0 }
}
