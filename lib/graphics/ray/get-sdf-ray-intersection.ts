import type { Vector3Tuple as V3 } from "../../engine/vector3-types"
import { subtractVector3 as sub } from "../../engine/subtract-vector3"
import { dotVector3 as dot } from "../../engine/dot-vector3"
import type { Primitive } from "./primitive-types"

export function getSdfRayIntersection(o: V3, d: V3, p: Primitive): number {
  const oc = sub(o, p.a),
    b = dot(oc, d),
    c = dot(oc, oc) - p.r * p.r,
    h = b * b - c
  if (h < 0) return -1
  const sq = Math.sqrt(h)
  let t = -b - sq
  const t1 = -b + sq
  const q: V3 = [0, 0, 0]
  for (let i = 0; i < 80 && t < t1; i++) {
    q[0] = o[0] + d[0] * t
    q[1] = o[1] + d[1] * t
    q[2] = o[2] + d[2] * t
    const dd = p.sd!(q)
    if (dd < 2e-4) return t
    t += Math.max(dd * 0.9, 1e-4)
  }
  return -1
}
