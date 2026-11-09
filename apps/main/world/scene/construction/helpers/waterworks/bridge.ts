import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { bridgeDeckH } from "#/world/scene/bridge-deck-h"
import { currentLayout } from "#/world/scene/current-layout"
import { M } from "#/world/scene/construction/materials"

// ---------------------------------------------------------------- bridge, lavoir, embankment railings
export function bridge(root: THREE.Group) {
  const B = currentLayout().bridge
  const gb = new GB()
  const n = 14
  for (const i = { value: 0 }; i.value < n; i.value++) {
    const xa = B.x0 + ((B.x1 - B.x0) * i.value) / n,
      xb = B.x0 + ((B.x1 - B.x0) * (i.value + 1)) / n
    const ya = bridgeDeckH(xa),
      yb = bridgeDeckH(xb)
    // deck
    gb.quad({ material: M.ashlar, a: [xa, ya, B.z1], b: [xb, yb, B.z1], c: [xb, yb, B.z0], d: [xa, ya, B.z0], repeatU: 4, repeatV: 4 })
    // sides with arch underside
    const archY = (x: number) => {
      const c = (B.x0 + B.x1) / 2,
        hw = 1.9
      const t = (x - c) / hw
      return Math.abs(t) < 1 ? -1.0 + Math.sqrt(1 - t * t) * 0.85 : -1.6
    }
    for (const z of [B.z1, B.z0]) {
      const p = z === B.z1
      const q = (x: number, y: number): [number, number, number] => [x, y, z]
      if (p) gb.quad({ material: M.ashlar, a: q(xa, archY(xa)), b: q(xb, archY(xb)), c: q(xb, yb), d: q(xa, ya), repeatU: 4, repeatV: 4 })
      else gb.quad({ material: M.ashlar, a: q(xb, archY(xb)), b: q(xa, archY(xa)), c: q(xa, ya), d: q(xb, yb), repeatU: 4, repeatV: 4 })
      // parapet
      const zi = p ? z - 0.18 : z + 0.18
      gb.quad({ material: M.ashlar, a: [xa, ya, p ? z : zi], b: [xb, yb, p ? z : zi], c: [xb, yb + 0.5, p ? z : zi], d: [xa, ya + 0.5, p ? z : zi], repeatU: 4, repeatV: 4 })
      gb.quad({ material: M.ashlar, a: [xb, yb, p ? zi : z], b: [xa, ya, p ? zi : z], c: [xa, ya + 0.5, p ? zi : z], d: [xb, yb + 0.5, p ? zi : z], repeatU: 4, repeatV: 4 })
      gb.quad({
        material: M.ashlar,
        a: [xa, ya + 0.5, Math.max(z, zi)],
        b: [xb, yb + 0.5, Math.max(z, zi)],
        c: [xb, yb + 0.5, Math.min(z, zi)],
        d: [xa, ya + 0.5, Math.min(z, zi)],
        repeatU: 4,
        repeatV: 4,
      })
    }
    // arch soffit
    const c = (B.x0 + B.x1) / 2
    if (Math.abs((xa + xb) / 2 - c) < 1.9) {
      const archYa = -1.0 + Math.sqrt(Math.max(0, 1 - ((xa - c) / 1.9) ** 2)) * 0.85
      const archYb = -1.0 + Math.sqrt(Math.max(0, 1 - ((xb - c) / 1.9) ** 2)) * 0.85
      gb.quad({ material: M.stoneDark, a: [xa, archYa, B.z0], b: [xb, archYb, B.z0], c: [xb, archYb, B.z1], d: [xa, archYa, B.z1], repeatU: 4, repeatV: 4 })
    }
  }
  root.add(gb.build())
}
