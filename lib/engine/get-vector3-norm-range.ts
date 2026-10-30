import type { Vector3 as V3 } from "./vector3-types"
import { addVector3 } from "./add-vector3"
import { subtractVector3 } from "./subtract-vector3"
import { scaleVector3 } from "./scale-vector3"
import { dotVector3 } from "./dot-vector3"
export function getVector3NormRange(a: V3, b: V3) {
  const v = subtractVector3(b, a),
    l2 = dotVector3(v, v),
    t = l2 ? Math.max(0, Math.min(1, -dotVector3(a, v) / l2)) : 0
  return { min: Math.hypot(...addVector3(a, scaleVector3(v, t))), max: Math.max(Math.hypot(...a), Math.hypot(...b)) }
}
