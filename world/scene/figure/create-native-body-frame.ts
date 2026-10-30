import { buildBody } from "#/world/scene/figure/body"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { NativeBodyFrame } from "#/world/scene/figure/native-body-frame-types"

/** Share geometry only within one synchronous pose check; no pose or look cache survives the invocation. */
export function createNativeBodyFrame(look: Look, skeleton: Skel): NativeBodyFrame {
  return { look, skeleton, body: buildBody(look, skeleton, null) }
}
