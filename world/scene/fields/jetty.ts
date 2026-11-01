import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { groundH } from "#/world/scene/ground-h"
import { WATER_Y } from "#/world/maps/ground/rules"

type Props = { root: THREE.Group; x0: number; z0: number; x1: number; z1: number }

/**
 * A plank jetty from the bank out over the water, on posts: where the marsh folk tie their punts and
 * reach the deeper water for roots and fish. Its deck keeps level with the bank it leaves.
 */
export function jetty(props: Props) {
  const g = new GB()
  const dx = props.x1 - props.x0,
    dz = props.z1 - props.z0,
    len = Math.hypot(dx, dz)
  const ux = dx / len,
    uz = dz / len,
    px = -uz,
    pz = ux
  const deck = Math.max(groundH(props.x0, props.z0), WATER_Y + 0.25) + 0.08
  const w = 0.55
  for (let s = 0, k = 0; s < len; s += 0.32, k++) {
    // one plank across the deck, some a little short or askew
    const sh = (k * 37) % 7 === 0 ? 0.12 : 0
    const cx = props.x0 + ux * s,
      cz = props.z0 + uz * s
    const a = (o: number, t: number): [number, number, number] => [cx + px * o + ux * t, deck + ((k * 13) % 5 === 0 ? -0.015 : 0), cz + pz * o + uz * t]
    g.quad({ material: (k * 5) % 3 === 0 ? M.woodDark : M.wood, a: a(-w + sh, 0), b: a(w, 0), c: a(w, 0.28), d: a(-w + sh, 0.28), repeatU: 1, repeatV: 1 })
    // posts every few planks, down into the mud
    if (k % 4 === 0)
      for (const o of [-w + 0.06, w - 0.06]) {
        const qx = cx + px * o,
          qz = cz + pz * o
        g.cyl({ side: M.woodDark, top: null, centerX: qx, centerZ: qz, fromY: Math.min(groundH(qx, qz), WATER_Y) - 0.4, toY: deck + (k === 0 ? 0.25 : 0.12), fromRadius: 0.06, segments: 5 })
      }
  }
  // a mooring post at the far end with rope wound round it
  const ex = props.x1 - ux * 0.2 + px * (w + 0.12),
    ez = props.z1 - uz * 0.2 + pz * (w + 0.12)
  g.cyl({ side: M.woodDark, top: null, centerX: ex, centerZ: ez, fromY: WATER_Y - 0.6, toY: deck + 0.45, fromRadius: 0.08, segments: 6 })
  g.cyl({ side: M.rope, top: null, centerX: ex, centerZ: ez, fromY: deck + 0.2, toY: deck + 0.3, fromRadius: 0.1, segments: 6 })
  props.root.add(g.build())
}
