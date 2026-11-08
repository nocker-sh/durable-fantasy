import { getNativeBody } from "#/world/scene/figure/get-native-body"
import type { NativeBodyFrame } from "#/world/scene/figure/native-body-frame-types"
import { createBodyContext } from "#/world/scene/figure/context"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = { native?: NativeBodyFrame; look: Look; skeleton: Skel; hand: "l" | "r"; margin: number }

/** Exclude only the moving arm's own primitives; shoulder attachment and upper arm remain separate. */
export function getForearmSelfClearanceError(props: Props): Error | null {
  if (!Number.isFinite(props.margin) || props.margin < 0) return new Error("Invalid forearm self-clearance margin")
  if (props.hand === "l" && props.look.shield) return new Error("Moving shield needs a separate self-clearance certificate")
  const body = getNativeBody(props)
  if (body instanceof Error) return body
  const moving = new Set(body.armParts[props.hand])
  const scale = createBodyContext(props.look, props.skeleton, null).S,
    joints = props.skeleton.p
  const shape = nativeArmSurfaces({ scale: scale, shoulder: joints[`upperarm_${props.hand}`], elbow: joints[`lowerarm_${props.hand}`], wrist: joints[`hand_${props.hand}`] })
  const surfaces = [shape.forearm(), shape.uncutCuff]
  for (const primitive of body.prims) {
    if (moving.has(primitive)) continue
    for (const surface of surfaces)
      if (!canSeparateSurfaceFromPrimitive({ surface, primitive, margin: props.margin }))
        return new Error("Native forearm self-clearance remains unresolved", { cause: { primitive: primitive.id, hand: props.hand } })
  }

  return null
}
