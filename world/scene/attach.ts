import { qrot } from "#/lib/engine/qrot"
import type { V3, Bone, Skel } from "#/world/scene/rig"

/** Carry a point given in rest space along with a bone. */
export function attach(K: Skel, b: Bone, restPt: V3): V3 {
  const r = K.rest[b],
    o = qrot(K.q[b], [restPt[0] - r[0], restPt[1] - r[1], restPt[2] - r[2]])
  return [K.p[b][0] + o[0], K.p[b][1] + o[1], K.p[b][2] + o[2]]
}
