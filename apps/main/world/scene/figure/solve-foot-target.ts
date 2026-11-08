import { solveTwoBone } from "#/lib/engine/solve-two-bone"
import { qfromTo } from "#/lib/engine/qfrom-to"
import { qmul } from "#/lib/engine/qmul"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { type Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { Bone, Skel } from "#/world/scene/rig"
type Props = { skeleton: Skel; side: "l" | "r"; target: Point3 }
/** Preserve both native leg lengths and the existing heel-to-toe orientation; unreachable foot placements fail instead of stretching. */
export function solveFootTarget(props: Props): Skel | Error {
  if (!props.target.every(Number.isFinite)) return new Error("Invalid native foot target")
  const hip: Bone = `thigh_${props.side}`,
    knee: Bone = `calf_${props.side}`,
    foot: Bone = `foot_${props.side}`,
    ball: Bone = `ball_${props.side}`
  const native = props.skeleton,
    target: V3 = [...props.target]
  const upper = Math.hypot(...sub(native.rest[knee], native.rest[hip])),
    lower = Math.hypot(...sub(native.rest[foot], native.rest[knee]))
  const solved = solveTwoBone({ root: native.p[hip], target: target, upper: upper, lower: lower, pole: native.p[knee] })
  if (!solved) return new Error("Native foot target is unreachable without stretching the leg")
  const p = { ...native.p, [knee]: [...solved.joint], [foot]: target, [ball]: add(target, sub(native.p[ball], native.p[foot])) }
  const q = { ...native.q }
  q[hip] = qmul(qfromTo(sub(native.p[knee], native.p[hip]), sub(p[knee], p[hip])), native.q[hip])
  q[knee] = qmul(qfromTo(sub(native.p[foot], native.p[knee]), sub(p[foot], p[knee])), native.q[knee])
  return { ...native, p, q }
}
