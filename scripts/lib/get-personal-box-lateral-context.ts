import { smooth } from "#/lib/engine/smooth"
import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { getPersonalBoxReachPose } from "#/scripts/lib/get-personal-box-reach-pose"
import { getStorageLidMotionState } from "#/world/town/get-storage-lid-motion-state"
type Props = Parameters<typeof getPersonalBoxLidReview>[0] & { cycle: number; phase: number }

/** Only the authored straight southward segment may use this right-leading low step. */
export function getPersonalBoxLateralContext(props: Props) {
  const source = props.slot.packing?.opening?.reach_review?.grip_review?.motion_review?.lateral_review,
    plan = getPersonalBoxLidReview(props)
  if (!source || plan instanceof Error) return new Error("Personal box has no lateral stepping proposal")
  if (!Number.isSafeInteger(source.cycles) || source.cycles < 1 || source.cycles > 16 || !Number.isSafeInteger(props.cycle) || props.cycle < 0 || props.cycle >= source.cycles)
    return new Error("Invalid personal box lateral cycle")
  if (!Number.isFinite(props.phase) || props.phase < 0 || props.phase > 1 || source.leading_foot !== "r") return new Error("Invalid personal box lateral phase")
  const from = plan.offsets[1],
    to = plan.offsets[2]
  if (from[0] !== to[0] || from[1] !== to[1] || to[2] <= from[2]) return new Error("Personal box low step needs a straight southward lid path")
  const progress = smooth(0, 1, props.phase)
  const motion = getStorageLidMotionState({ plan, segment: 1, progress: (props.cycle + progress) / source.cycles })
  if (motion instanceof Error) return motion
  const base = getPersonalBoxReachPose({ ...props, parts: motion.parts })
  if (base instanceof Error) return base

  return { source, base, parts: motion.parts, stride: (to[2] - from[2]) / source.cycles }
}
