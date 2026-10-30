import { getTwoBoneJointSpeedLimit } from "./get-two-bone-joint-speed-limit"
import type { Vector3 as V3 } from "./vector3-types"
import { subtractVector3 } from "./subtract-vector3"
import { crossVector3 } from "./cross-vector3"
import { getVector3NormRange } from "./get-vector3-norm-range"
import { twoBoneSegmentReach } from "./two-bone-segment-reach"
import type { TwoBoneSegment } from "./two-bone-types"
type Props = TwoBoneSegment & Readonly<{ pole: V3 }>
/** Upper bound on joint speed over a normalized straight target segment. Singular bend planes remain unresolved. */
export function twoBoneJointSpeedBound(props: Props): number | undefined {
  if (![...props.pole].every(Number.isFinite)) throw new Error("Invalid two-bone dimensions")
  if (!twoBoneSegmentReach({ root: props.root, from: props.from, to: props.to, upper: props.upper, lower: props.lower })) return undefined
  const velocity = Math.hypot(...subtractVector3(props.to, props.from))
  if (velocity === 0) return 0
  const da = subtractVector3(props.from, props.root),
    db = subtractVector3(props.to, props.root),
    distance = getVector3NormRange(da, db),
    p = subtractVector3(props.pole, props.root),
    bendMin = getVector3NormRange(crossVector3(p, da), crossVector3(p, db)).min / distance.max
  if (distance.min <= 0 || bendMin <= 1e-12) return undefined
  return getTwoBoneJointSpeedLimit({ upper: props.upper, lower: props.lower, velocity, poleOffset: p, distance, bendMinimum: bendMin })
}
