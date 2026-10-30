import { getPersonalBoxLateralContext } from "#/scripts/lib/get-personal-box-lateral-context"
import { getPersonalBoxGripFromReach } from "#/scripts/lib/get-personal-box-grip-from-reach"
import { getNativeLowSideStepPose } from "#/world/scene/figure/get-native-low-side-step-pose"
import { getNativeBimanualReachPose } from "#/world/scene/figure/get-native-bimanual-reach-pose"
import { getNativeLowStepGroundError } from "#/world/scene/figure/get-native-low-step-ground-error"
type Props = Parameters<typeof getPersonalBoxLateralContext>[0]

/** Finite lateral samples solve the same native legs and full bridge contact; continuous clearance and balance remain separate. */
export function getPersonalBoxLateralFrame(props: Props) {
  const context = getPersonalBoxLateralContext(props)
  if (context instanceof Error) return context
  const base = context.base,
    step = getNativeLowSideStepPose({
      skeleton: base.skeleton,
      phase: props.phase,
      stride: context.stride,
      lift: context.source.foot_lift_m,
      pelvisRise: context.source.pelvis_rise_m,
      direction: "right",
    })
  if (step instanceof Error) return step
  const posed = getNativeBimanualReachPose({
    look: base.look,
    skeleton: step.skeleton,
    targets: base.targets,
    body: base.body,
    heading: Math.PI / 2,
    poles: { l: [1, -0.3, -0.2], r: [-1, -0.3, -0.2] },
  })
  if (posed instanceof Error) return posed
  const ground = getNativeLowStepGroundError({ look: base.look, skeleton: posed.skeleton, rootY: posed.rootY, offsets: step.offsets })
  if (ground) return ground

  return getPersonalBoxGripFromReach({ ...props, parts: context.parts, frame: { ...base, skeleton: step.skeleton, posed } })
}
