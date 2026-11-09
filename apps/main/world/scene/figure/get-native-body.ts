import { buildBody } from "#/world/scene/figure/body"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { NativeBodyFrame } from "#/world/scene/figure/native-body-frame-types"
type Props = { look: Look; skeleton: Skel; native?: NativeBodyFrame }

/** A prepared frame belongs to the exact look and skeleton being checked; standalone callers build their own body. */
export function getNativeBody(props: Props) {
  if (!props.native) return buildBody(props.look, props.skeleton, null)
  if (props.native.look !== props.look || props.native.skeleton !== props.skeleton) return new Error("Native body frame belongs to a different pose or look")
  return props.native.body
}
