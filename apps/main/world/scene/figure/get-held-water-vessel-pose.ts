import { createNativeBodyFrame } from "#/world/scene/figure/create-native-body-frame"
import { getWaterVesselPrimitives } from "#/world/scene/figure/get-water-vessel-primitives"
import { getWaterVesselGripPose } from "#/world/scene/figure/get-water-vessel-grip-pose"
import { getWaterJarBodyError } from "#/world/scene/figure/get-water-jar-body-error"
import { getWaterHandleBodyError } from "#/world/scene/figure/get-water-handle-body-error"
import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
type Props = Parameters<typeof getWaterVesselGripPose>[0]

/** Static native frames only: full vessel clearance and analytic grip openings do not establish load, turning or a safe journey. */
export function getHeldWaterVesselPose(props: Props) {
  const posed = getWaterVesselGripPose(props)
  if (posed instanceof Error) return posed
  const native = createNativeBodyFrame(props.look, posed.skeleton)
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const error = getForearmSelfClearanceError({ look: props.look, skeleton: posed.skeleton, native, hand, margin: 0 })
    if (error) return error
  }
  const parts = { look: props.look, skeleton: posed.skeleton, native, parts: posed.parts }
  const clearance = getWaterJarBodyError(parts) ?? getWaterHandleBodyError(parts)
  if (clearance) return clearance

  const primitives = getWaterVesselPrimitives(posed.parts)
  if (primitives instanceof Error) return primitives

  return { ...posed, primitives }
}
