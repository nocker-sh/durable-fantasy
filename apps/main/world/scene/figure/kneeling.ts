import type { Skel, Bone } from "#/world/scene/rig"
import type { Look } from "#/world/scene/figure/look"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { qfromTo } from "#/lib/engine/qfrom-to"
import { qmul } from "#/lib/engine/qmul"
import { solveTwoBone } from "#/lib/engine/solve-two-bone"
import { solveTwoBoneAtHeight } from "#/lib/engine/solve-two-bone-at-height"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
export type KneelingConstraint = {
  pelvis_drop_m: number
  knee: "l" | "r"
}
/** Pins the existing shoe orientations and one clothed knee without changing any leg length. */
export function kneelingPose(look: Look, skeleton: Skel, constraint: KneelingConstraint): Skel {
  if (!Number.isFinite(constraint.pelvis_drop_m) || constraint.pelvis_drop_m <= 0) throw new Error("Invalid kneeling pelvis drop")
  const body = buildBody(look, skeleton, null),
    ground = groundFootwear(body.footwear),
    contact = body.knees[constraint.knee]
  if (!contact) throw new Error("Native kneeling has no modelled knee surface")
  const p = Object.fromEntries(
      Object.entries(skeleton.p).map((entry) => {
        const bone = entry[0]
        const v = entry[1]
        return [bone, [v[0], v[1] - constraint.pelvis_drop_m, v[2]]]
      }),
    ) as Skel["p"],
    q = { ...skeleton.q }
  const length = (a: V3, b: V3) => Math.hypot(...sub(a, b))
  for (const side of ["l", "r"] as const) {
    const hip = `thigh_${side}` as const,
      knee = `calf_${side}` as const,
      foot = `foot_${side}` as const,
      ball = `ball_${side}` as const,
      gap = ground.feet.find((f) => f.side === side)!.clearance
    const target: V3 = [skeleton.p[foot][0], skeleton.p[foot][1] - gap, skeleton.p[foot][2]],
      pole = skeleton.p[knee],
      upper = length(skeleton.rest[hip], skeleton.rest[knee]),
      lower = length(skeleton.rest[knee], skeleton.rest[foot])
    const solved =
      side === constraint.knee
        ? solveTwoBoneAtHeight({ root: p[hip], target: target, upper: upper, lower: lower, pole: pole, height: contact.r - ground.rootY })
        : solveTwoBone({ root: p[hip], target: target, upper: upper, lower: lower, pole: pole })
    if (!solved) throw new Error("Native kneeling contacts are unreachable without stretching a leg")
    p[knee] = [...solved.joint]
    p[foot] = target
    p[ball] = [skeleton.p[ball][0], skeleton.p[ball][1] - gap, skeleton.p[ball][2]]
    for (const entry2 of [
      [hip, knee],
      [knee, foot],
    ] as [Bone, Bone][]) {
      const bone = entry2[0]
      const next = entry2[1]
      q[bone] = qmul(qfromTo(sub(skeleton.p[next], skeleton.p[bone]), sub(p[next], p[bone])), skeleton.q[bone])
    }
  }
  const posed = { ...skeleton, p, q },
    actual = buildBody(look, posed, null),
    footing = groundFootwear(actual.footwear),
    knee = actual.knees[constraint.knee]
  if (!knee || Math.abs(knee.c[1] + footing.rootY - knee.r) > 1e-9 || footing.feet.some((f) => Math.abs(f.clearance) > 1e-9)) throw new Error("Native kneeling floor contacts remain unresolved")
  return posed
}
