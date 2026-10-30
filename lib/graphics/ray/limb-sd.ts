import { getLimbEnvelope } from "#/lib/graphics/ray/get-limb-envelope"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"

// One limb as a single surface: tapered round cones joined at shared joint spheres, so
// shoulder, elbow, wrist and hand (or hip, knee, ankle) flow without knobs or seams.
export function limbSd(pts: V3[], rs: number[]) {
  const G = pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1],
      ba = sub(b, a),
      l2 = Math.max(1e-8, dot(ba, ba)),
      rr = rs[i] - rs[i + 1]
    return { a, ba, l2, rr, a2: l2 - rr * rr, il2: 1 / l2, r1: rs[i], r2: rs[i + 1] }
  })
  // round cone (iq)
  const rc = (p: V3, g: (typeof G)[number]) => {
    const pa0 = p[0] - g.a[0],
      pa1 = p[1] - g.a[1],
      pa2 = p[2] - g.a[2]
    const y = pa0 * g.ba[0] + pa1 * g.ba[1] + pa2 * g.ba[2],
      z = y - g.l2
    const qx = pa0 * g.l2 - g.ba[0] * y,
      qy = pa1 * g.l2 - g.ba[1] * y,
      qz = pa2 * g.l2 - g.ba[2] * y
    const x2 = qx * qx + qy * qy + qz * qz,
      y2 = y * y * g.l2,
      z2 = z * z * g.l2
    const k = Math.sign(g.rr) * g.rr * g.rr * x2
    if (Math.sign(z) * g.a2 * z2 > k) return Math.sqrt(x2 + z2) * g.il2 - g.r2
    if (Math.sign(y) * g.a2 * y2 < k) return Math.sqrt(x2 + y2) * g.il2 - g.r1
    return (Math.sqrt(x2 * g.a2 * g.il2) + y * g.rr) * g.il2 - g.r1
  }
  const sd = (p: V3, hit?: { i: number }) => {
    const d = { value: 1e9 }
    for (const i = { value: 0 }; i.value < G.length; i.value++) {
      const di = rc(p, G[i.value])
      if (di < d.value) {
        d.value = di
        if (hit) hit.i = i.value
      }
    }
    return d.value
  }
  const envelope = getLimbEnvelope(pts, rs)
  return { sd, ...envelope, capsuleBounds: () => pts.slice(0, -1).map((a, i) => ({ a, b: pts[i + 1], r: Math.max(rs[i], rs[i + 1]) })) }
}
