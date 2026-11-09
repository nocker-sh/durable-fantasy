import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { Rng } from "#/lib/engine/random"
import { groundH } from "#/world/scene/ground-h"
import { rust } from "#/world/scene/fields/rusted-machine"
import { rustDark } from "#/world/scene/fields/rusted-machine"
import { blockCircle } from "#/world/scene/block-circle"
export function warLitter(props: Readonly<{ root: THREE.Group; x: number; z: number; seed: number }>) {
  const root = props.root,
    x = props.x,
    z = props.z,
    seed = props.seed
  const gb = new GB()
  const r = new Rng(seed)
  for (let k = 0; k < 9; k++) {
    const a = r.next() * Math.PI * 2,
      d = 2.4 + r.next() * 3
    const px = x + Math.cos(a) * d,
      pz = z + Math.sin(a) * d
    const y = groundH(px, pz)
    const kind = k % 3
    if (kind === 0)
      gb.box({
        side: rust,
        top: rustDark,
        x0: px - 0.35,
        y0: y - 0.05,
        z0: pz - 0.25,
        x1: px + 0.35,
        y1: y + 0.08,
        z1: pz + 0.25,
        repeat: 2,
      })
    else if (kind === 1)
      gb.cyl({
        side: rustDark,
        top: rust,
        centerX: px,
        centerZ: pz,
        fromY: y - 0.25,
        toY: y + 0.35,
        fromRadius: 0.4,
        toRadius: 0.4,
        segments: 9,
        repeat: 2,
      })
    else
      gb.box({
        side: rust,
        top: null,
        x0: px - 0.05,
        y0: y - 0.1,
        z0: pz - 0.05,
        x1: px + 0.05,
        y1: y + 0.9 + r.next() * 0.5,
        z1: pz + 0.05,
        repeat: 1,
      })
    if (kind === 1) blockCircle(px, pz, 0.35)
  }
  root.add(gb.build())
}
