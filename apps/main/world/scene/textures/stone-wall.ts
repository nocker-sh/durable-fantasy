import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  x: number
  y: number
  H: number
  seed: number
}

/**
 * One pixel of a laid-stone wall, as a tone to paint: rounded stones of uneven size, lit on their
 * upper left and shading to the lower right, set in mortar only a little darker than the stone;
 * damp and moss rising at the foot. Each stone is its own region, so strokes stay inside it.
 */
export function stoneWall(props: Props): { ramp: string; level: number; region: number } {
  const v = props.H - 1 - props.y
  const row = Math.floor(props.y / 9),
    bw = 13 + Math.floor(hash2(row, 0, props.seed) * 7)
  const u = props.x / bw + (row % 2) * 0.5 + hash2(row, 1, props.seed) * 0.3,
    c = Math.floor(u),
    fu = u - c,
    fv = props.y / 9 - row
  const wash = vnoise({ x: props.x, y: props.y, scale: 0.05, seed: props.seed + 8 })
  const damp = Math.max(0, (14 - v) / 14)
  // mortar: the gaps between stones, and the corners rounded off each stone
  const cu = Math.min(fu, 1 - fu) * bw,
    cv = Math.min(fv, 1 - fv) * 9
  const corner = cu < 2 && cv < 2 && Math.hypot(2 - cu, 2 - cv) > 2
  const stain = vnoise({ x: props.x, y: props.y, scale: 0.06, seed: props.seed + 20 })
  if (fu < 0.07 || fv > 0.87 || corner) {
    if ((v < 14 || stain > 0.6) && hash2(props.x >> 1, props.y, props.seed + 3) > 0.35) return { ramp: "moss", level: 2.4 + wash * 0.6, region: -1 }
    return { ramp: "stone", level: 1.5 + wash * 0.5 - damp * 0.4, region: -1 }
  }
  const l = { value: 2.6 + (hash2(c, row, props.seed) - 0.5) * 0.8 + (wash - 0.5) * 0.7 - damp * 0.7 }
  // damp stains over several stones, and dark streaks running down from the eaves
  if (stain > 0.72) l.value -= 1
  else if (stain > 0.62) l.value -= 0.5
  if (hash2(props.x >> 1, 0, props.seed + 9) > 0.86 && props.y < props.H * (0.3 + hash2(props.x >> 1, 1, props.seed + 9) * 0.5)) l.value -= 0.6
  // pale lichen in small rosettes on the dry stones
  if (stain < 0.45 && vnoise({ x: props.x, y: props.y, scale: 0.35, seed: props.seed + 21 }) > 0.82) return { ramp: "sand", level: 4, region: c * 64 + row }
  if (fv < 0.22 || fu < 0.14) l.value += 0.5 // the lit upper left of the stone
  else if (fv > 0.68 || fu > 0.88) l.value -= 0.5 // its shaded lower right
  if (v < 7 && hash2(props.x >> 1, props.y >> 1, props.seed + 6) > 0.75) return { ramp: "moss", level: 2.8 + (fv < 0.4 ? 0.5 : 0), region: c * 64 + row }
  return { ramp: "stone", level: l.value, region: c * 64 + row }
}
