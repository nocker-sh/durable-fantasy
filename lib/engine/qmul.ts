import type { Q } from "./quaternion-types"
/** Composition: apply b, then a. */
export function qmul(a: Q, b: Q): Q {
  const axState = a,
    ax = axState[0],
    ay = axState[1],
    az = axState[2],
    aw = axState[3],
    bxState = b,
    bx = bxState[0],
    by = bxState[1],
    bz = bxState[2],
    bw = bxState[3]
  return [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz]
}
