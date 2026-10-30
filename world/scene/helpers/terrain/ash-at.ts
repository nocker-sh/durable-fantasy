import type { RGB } from "#/lib/graphics/pixel-types"
import { hash2 } from "#/lib/engine/hash2"
import { fbm } from "#/lib/engine/fbm"
import { roadD } from "#/world/scene/road-d"
import { ASH_LIGHT, ASH_DARK } from "#/world/scene/terrain"

/**
 * Ash over the ground (world.md「気候」): a thin grey film everywhere, lying in drifts where the
 * wind leaves it, and swept up into a grey bank along each side of a road — the road itself is
 * kept clear, with footprints in what is left on it.
 */
type Props = {
  x: number
  z: number
  sx: number
  sy: number
}

export function ashAt(props: Props): RGB | null {
  const d = roadD(props.x, props.z)
  // The swept road has its own distribution, independent of the wind drifts.
  const drift = d < -0.05 ? 0 : fbm({ x: props.x, y: props.z, scale: 0.35, seed: 77 })
  // swept to the road's edges, a hand's width either side
  const bank = d > -0.05 && d < 0.35 ? 1 - Math.abs(d - 0.15) / 0.2 : 0
  const k = { value: 0.06 + Math.max(0, drift - 0.55) * 0.8 + Math.max(0, bank) * 0.5 }
  if (d < -0.05) k.value = 0.06 + (hash2(props.sx >> 1, props.sy >> 1, 91) > 0.9 ? 0.25 : 0)
  // pixel by pixel, so the film is grains, not a wash
  const grain = hash2(props.sx, props.sy, 93)
  if (grain > 1 - k.value) return grain > 1 - k.value * 0.4 ? ASH_LIGHT : ASH_DARK
  return null
}
