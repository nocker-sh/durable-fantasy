import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { V2 } from "#/world/scene/construction/registry"
import { Rng } from "#/lib/engine/random"
import { isFree } from "#/world/scene/is-free"
import { THINGS } from "#/world/scene/props/catalog"
import type { HouseDef } from "#/world/town/house-types"
import type { Side } from "#/world/scene/dressing"
import { OUT, placed } from "#/world/scene/dressing"
import { along } from "#/world/scene/helpers/dressing/along"
import { clear } from "#/world/scene/helpers/dressing/clear"

/** Set one of the small things (things.ts) by a house's wall: hung on it, leant on it, or stood a step out. */
type Props = {
  root: THREE.Group
  gb: GB
  h: HouseDef
  id: string
  side: Side
  r: Rng
}

export function placeThing(props: Props) {
  const thing = THINGS[props.id]
  if (!thing) return
  const off = thing.wall === "hang" ? 0.12 : thing.wall === "stand" ? 0.22 : 0.45 + thing.r
  const spots = along({ h: props.h, side: props.side, off: off, step: 0.45 })
  // start somewhere along the wall, not always at its corner
  const from = Math.floor(props.r.next() * Math.max(1, spots.length))
  const order = [...spots.slice(from), ...spots.slice(0, from)]
  // a thing hung on the wall takes no ground; one lying flat only needs its spot clear; the rest a clear circle
  // and nothing that takes ground goes where it would narrow a way: the ground on its open side, away from the wall, stays free
  const oxState = OUT[props.side],
    ox = oxState[0],
    oz = oxState[1]
  const roomy = (q: V2) =>
    [-1, -0.5, 0, 0.5, 1].every((a) => {
      const reach = thing.r + 0.9
      const dx = ox * Math.cos(a) - oz * Math.sin(a),
        dz = oz * Math.cos(a) + ox * Math.sin(a)
      return isFree(q[0] + dx * reach, q[1] + dz * reach)
    })
  const p = thing.wall === "hang" ? order[0] : thing.r === 0 ? order.find((q) => clear(props.h, q, 0.15)) : order.find((q) => clear(props.h, q, Math.max(thing.r, 0.12)) && roomy(q))
  if (!p) return
  thing.build({ builder: props.gb, x: p[0], z: p[1], seed: props.h.seed + props.id.length, along: props.side === "n" || props.side === "s" })
  placed.push(`${props.h.id}:${props.id}`)
  void props.root
}
