import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { hash2 } from "#/lib/engine/hash2"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { trunkGeo } from "#/world/scene/fields/vegetation"

const coneGeo = new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0)

const grey = (k: number) => {
  const v = Math.max(0, Math.min(255, Math.round(255 * k)))
  return (v << 16) | (v << 8) | v
}

// four tiers of boughs, each narrower and lighter than the one below it: radius, height, how high it sits, shade
const TIERS: readonly (readonly [number, number, number, number])[] = [
  [0.98, 1.15, 0.5, 0.78],
  [0.8, 1.05, 1.05, 0.88],
  [0.6, 0.95, 1.55, 0.97],
  [0.38, 0.85, 2.05, 1.06],
]

type Props = {
  root: THREE.Group
  spots: Spot[]
  boughs: THREE.Material
  /** the material of the top tier of the trees `capped` picks out (frost on a pine standing in the open) */
  cap?: THREE.Material
  capped?: (s: Spot) => boolean
}

/** Cone-shaped trees in four tiers of boughs, each tree a little lighter or darker than its neighbours. */
export function conifers(props: Props) {
  instanced({
    root: props.root,
    geo: trunkGeo,
    material: M.woodDark,
    spots: props.spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s * 1.1, s.s],
    ],
  })
  const cap = props.cap
  const capped = (s: Spot) => !!cap && !!props.capped && props.capped(s)
  TIERS.forEach((tier, i) => {
    const tint = (s: Spot) => grey(tier[3] * (0.88 + hash2(Math.floor(s.x * 5), Math.floor(s.z * 5), 19) * 0.24))
    const at = (s: Spot): ReturnType<Parameters<typeof instanced>[0]["place"]> => [
      [s.x, groundH(s.x, s.z) + tier[2] * s.s, s.z],
      [0, s.r + i, 0],
      [tier[0] * s.s, tier[1] * s.s, tier[0] * s.s],
    ]
    if (i < 3 || !cap) instanced({ root: props.root, geo: coneGeo, material: props.boughs, spots: props.spots, place: at, tint: tint })
    else {
      instanced({ root: props.root, geo: coneGeo, material: cap, spots: props.spots.filter(capped), place: at })
      instanced({ root: props.root, geo: coneGeo, material: props.boughs, spots: props.spots.filter((s) => !capped(s)), place: at, tint: tint })
    }
  })
  for (const s of props.spots) blockCircle(s.x, s.z, 0.3 * s.s)
}
