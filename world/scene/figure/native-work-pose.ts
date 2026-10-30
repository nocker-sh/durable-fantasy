import type { ToolGripProfile } from "#/world/town/working-tool"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { kneelingPose } from "#/world/scene/figure/kneeling"
import { groundFootwear } from "#/world/scene/figure/footing"
import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
import { qfromTo } from "#/lib/engine/qfrom-to"
import { qmul } from "#/lib/engine/qmul"
import { qrot } from "#/lib/engine/qrot"
import type { Look } from "#/world/scene/figure/look"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import { buildBody } from "#/world/scene/figure/body"
import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"
import { workPoseTurn } from "#/world/scene/figure/work-pose-turn"

const inverseTurns = [0, 3, 2, 1] as const

type Props = {
  look: Look
  pose: WorkPoseCandidate
  target: V3
  gripAxis: V3
  profile?: ToolGripProfile
}

/** Ground the unchanged native shoe shapes, then solve one arm at its fixed bone lengths. */
export function nativeWorkPose(props: Props) {
  if (!Number.isInteger(props.pose.frame) || props.pose.frame < 0 || props.pose.frame >= FRAMES[props.pose.animation]) throw new Error("Invalid native work-pose frame")
  const baked = skelFor(props.look, props.pose.animation, props.pose.frame),
    skeleton = props.pose.kneeling ? kneelingPose(props.look, baked, props.pose.kneeling) : baked,
    footing = groundFootwear(buildBody(props.look, skeleton, null).footwear)
  if (props.pose.shoe_contacts) {
    const touching = footing.feet.filter((f) => Math.abs(f.clearance) <= 1e-9).map((foot) => `shoe_${foot.side}` as const),
      expected = new Set(props.pose.shoe_contacts)
    if (expected.size !== props.pose.shoe_contacts.length || touching.length !== expected.size || touching.some((side) => !expected.has(side)))
      throw new Error("Native shoe contacts do not match the declared pose")
  }
  const rootY = footing.rootY,
    turn = workPoseTurn(props.pose.facing),
    dx = props.target[0] - props.pose.body_m[0],
    dz = props.target[2] - props.pose.body_m[1]
  const inverseTurn = inverseTurns[turn],
    localXZ = quarterTurnPoint(dx, dz, inverseTurn)
  const gripDirection = quarterTurnPoint(props.gripAxis[0], props.gripAxis[2], inverseTurn),
    ax = gripDirection[0],
    az = gripDirection[1],
    localAxis: V3 = [ax, props.gripAxis[1], az]
  const workingSkeleton = { value: skeleton }
  if (props.pose.off_hand) {
    const off = props.pose.hand === "r" ? "l" : "r",
      point = props.pose.off_hand.palm_m,
      offHandPosition = quarterTurnPoint(point[0] - props.pose.body_m[0], point[2] - props.pose.body_m[1], inverseTurn),
      x = offHandPosition[0],
      z = offHandPosition[1],
      free = solveArmGrip({ skeleton: skeleton, side: off, target: [x, point[1] - rootY, z], pole: props.pose.off_hand.pole })
    if (!free) throw new Error("Native off-hand target is unreachable without stretching the arm")
    workingSkeleton.value = { ...skeleton, p: { ...skeleton.p, [`lowerarm_${off}`]: free.elbow, [`hand_${off}`]: free.wrist } }
  }
  const solution = solveArmGrip({ skeleton: workingSkeleton.value, side: props.pose.hand, target: [localXZ[0], props.target[1] - rootY, localXZ[1]], pole: props.pose.pole })
  if (!solution) throw new Error("Native working grip is unreachable without stretching the arm")
  const hand = `hand_${props.pose.hand}` as const,
    rotation = skeleton.q[hand],
    aligned = qmul(qfromTo(qrot(rotation, [0, 0, 1]), localAxis), rotation)
  const posed = {
    ...workingSkeleton.value,
    q: { ...workingSkeleton.value.q, [hand]: aligned },
    p: { ...workingSkeleton.value.p, [`lowerarm_${props.pose.hand}`]: solution.elbow, [`hand_${props.pose.hand}`]: solution.wrist },
  }
  if (props.profile) {
    const gripAcross = quarterTurnPoint(props.profile.across[0], props.profile.across[2], inverseTurn),
      x = gripAcross[0],
      z = gripAcross[1]
    posed.handGrips = {
      ...posed.handGrips,
      [props.pose.hand]: { axis: norm(localAxis), across: norm([x, props.profile.across[1], z]), halfWidth: props.profile.halfWidth, halfDepth: props.profile.halfDepth },
    }
  }
  return { skeleton: posed, rootY, footing: footing.feet, turn, solution, body: buildBody(props.look, posed, null) }
}
