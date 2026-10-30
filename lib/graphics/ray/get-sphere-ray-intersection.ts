import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"

export function getSphereRayIntersection(o: V3, d: V3, p: Primitive): number {
  const s: V3 = [p.sx ?? 1, p.sy ?? 1, p.sz ?? 1]
  const oc: V3 = [(o[0] - p.a[0]) / s[0], (o[1] - p.a[1]) / s[1], (o[2] - p.a[2]) / s[2]]
  const dd: V3 = [d[0] / s[0], d[1] / s[1], d[2] / s[2]]
  const A = dot(dd, dd),
    B = dot(oc, dd),
    C = dot(oc, oc) - p.r * p.r
  const h = B * B - A * C
  if (h < 0) return -1
  const sq = Math.sqrt(h)
  const t0 = (-B - sq) / A
  if (!p.clip) return t0
  if (p.clip(add(o, mul(d, t0)))) return t0
  const t1 = (-B + sq) / A
  if (p.clip(add(o, mul(d, t1)))) return t1 // inside of a shell (e.g. under a hood)
  return -1
}
