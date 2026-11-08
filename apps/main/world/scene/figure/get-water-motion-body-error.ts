import { createBodyContext } from "#/world/scene/figure/context"
import { buildBody } from "#/world/scene/figure/body"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { getWaterMotionVesselBodyError } from "#/world/scene/figure/get-water-motion-vessel-body-error"
import type { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import type { Look } from "#/world/scene/figure/look"
type Props = { look: Look; posed: Exclude<ReturnType<typeof getHeldWaterVesselPose>, Error>; margins: Readonly<Record<"l" | "r", number>>; vesselMargin: number }

/** Uncut skin encloses the moving skin, avoiding any assumption that a moving hole preserves a midpoint field. */
export function getWaterMotionBodyError(props: Props): Error | null {
  if (![props.margins.l, props.margins.r, props.vesselMargin].every((value) => Number.isFinite(value) && value >= 0)) return new Error("Invalid moving water body margin")
  const skeleton = { ...props.posed.skeleton, handGrips: undefined },
    body = buildBody(props.look, skeleton, null),
    joints = skeleton.p,
    scale = createBodyContext(props.look, skeleton, null).S
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const surfaces = nativeArmSurfaces({ scale: scale, shoulder: joints[`upperarm_${hand}`], elbow: joints[`lowerarm_${hand}`], wrist: joints[`hand_${hand}`] })
    const fields = [surfaces.forearm(), surfaces.uncutCuff]
    for (const primitive of body.prims) {
      if (body.armParts[hand].includes(primitive)) continue
      const other = hand === "l" ? "r" : "l",
        margin = props.margins[hand] + (body.armParts[other].includes(primitive) ? props.margins[other] : 0)
      if (!fields.every((surface) => canSeparateSurfaceFromPrimitive({ surface, primitive, margin }))) return new Error("Moving water forearm self-clearance remains unresolved")
    }
  }

  return getWaterMotionVesselBodyError({ ...props, body })
}
