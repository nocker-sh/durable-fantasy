import type { Vector3Tuple as V3 } from "../../engine/vector3-types"
import { normalizeVector3 as norm } from "../../engine/normalize-vector3"
import { addVector3 as add } from "../../engine/add-vector3"
import { subtractVector3 as sub } from "../../engine/subtract-vector3"
import type { Primitive } from "./primitive-types"

export function getSdfSurfaceNormal(q: V3, p: Primitive): V3 {
  const e = 1e-3,
    f = p.sd!
  return norm([f(add(q, [e, 0, 0])) - f(sub(q, [e, 0, 0])), f(add(q, [0, e, 0])) - f(sub(q, [0, e, 0])), f(add(q, [0, 0, e])) - f(sub(q, [0, 0, e]))])
}
