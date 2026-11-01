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
 * One pixel of plaster, as a tone to paint: broad washes of a lighter and a darker tone, a shadow
 * under the eaves, damp rising from the ground to a ragged tide line with moss along the foot,
 * old stains in patches, rain streaks running down from the eaves, and cracks. Plaster is one
 * region; strokes run across it.
 */
export function plasterWall(props: Props): { ramp: string; level: number; region: number } {
  const v = props.H - 1 - props.y
  const wash = vnoise({ x: props.x, y: props.y, scale: 0.04, seed: props.seed })
  const fine = vnoise({ x: props.x, y: props.y, scale: 0.11, seed: props.seed + 10 })
  const l = { value: props.top + (wash - 0.5) * 1.1 + (fine - 0.5) * 0.4 }
  l.value -= Math.max(0, (v - (props.H - 12)) / 12) ** 1.3 * 1.5 // shadow under the eaves
  // damp rising from the ground to a ragged tide line, and moss along the very foot
  const tide = 9 + vnoise({ x: props.x, y: 0, scale: 0.09, seed: props.seed + 11 }) * 14
  if (v < 3 + vnoise({ x: props.x, y: props.y, scale: 0.25, seed: props.seed + 12 }) * 6) return { ramp: "moss", level: 2.4 + fine, region: 1 }
  if (v < tide) l.value -= 0.8 + (1 - v / tide) * 0.6
  else if (v < tide + 2) l.value -= 1.2
  // old stains in patches, a lighter and a darker step
  const stain = vnoise({ x: props.x, y: props.y, scale: 0.05, seed: props.seed + 20 })
  if (stain > 0.74) l.value -= 1.1
  else if (stain > 0.64) l.value -= 0.6
  // rain streaks running down from the eaves, two pixels wide, fading as they go
  const sc = props.x >> 1
  if (hash2(sc, 0, props.seed + 2) > 0.82) {
    const len = props.H * (0.3 + hash2(sc, 1, props.seed + 2) * 0.5)
    const run = props.H - 1 - v
    if (run < len && hash2(sc, props.y >> 2, props.seed + 3) > 0.15) l.value -= run < len * 0.5 ? 0.8 : 0.5
  }
  // cracks: a stepped line running down and across, now and then with a branch
  const cx = Math.floor(props.x / 31),
    cy = Math.floor(props.y / 25)
  if (hash2(cx, cy, props.seed + 6) > 0.72) {
    const lx = props.x - cx * 31 - 6,
      ly = props.y - cy * 25 - 4
    const dir = hash2(cx, cy, props.seed + 7) > 0.5 ? 1 : -1
    const along = Math.floor(ly * 0.8 + Math.sin(ly * 0.7) * 1.5) * dir + (dir < 0 ? 14 : 0)
    if (ly >= 0 && ly < 18 && Math.abs(lx - along) < 1) l.value -= 1.6
  }
  return { ramp: props.ramp, level: l.value, region: 0 }
}
