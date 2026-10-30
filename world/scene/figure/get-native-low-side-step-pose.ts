import { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"
import { solveFootTarget } from "#/world/scene/figure/solve-foot-target"
import { BONE_ORDER } from "#/world/scene/rig"
import type { Skel } from "#/world/scene/rig"
type Props = Parameters<typeof getEasedSideStepOffsets>[0] & Readonly<{ skeleton: Skel; pelvisRise: number }>

/** Release the knee with a smooth pelvis rise before alternating shoes; contact targets alone do not certify balance or loads. */
export function getNativeLowSideStepPose(props: Props) {
  const offsets = getEasedSideStepOffsets(props)
  if (offsets instanceof Error) return offsets
  if (!Number.isFinite(props.pelvisRise) || props.pelvisRise <= 0) return new Error("Invalid low side-step pelvis rise")
  if (Object.keys(props.skeleton.handGrips ?? {}).length) return new Error("Native low step must precede hand contact constraints")
  if (props.phase === 0 || props.phase === 1) return { skeleton: props.skeleton, offsets }
  const rise = props.pelvisRise * Math.sin(Math.PI * props.phase) ** 2,
    p = { ...props.skeleton.p }
  for (const bone of BONE_ORDER) p[bone] = [p[bone][0], p[bone][1] + rise, p[bone][2]]
  const pose = { skeleton: { ...props.skeleton, p } }

  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const foot = props.skeleton.p[`foot_${side}`],
      shift = offsets[side]
    const solved = solveFootTarget({ skeleton: pose.skeleton, side, target: [foot[0] + shift[0], foot[1] + shift[1], foot[2] + shift[2]] })
    if (solved instanceof Error) return solved
    pose.skeleton = solved
  }

  return { skeleton: pose.skeleton, offsets }
}
