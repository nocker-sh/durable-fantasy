import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { buildBody } from "#/world/scene/figure/body"
export type NativeBodyFrame = Readonly<{ look: Look; skeleton: Skel; body: ReturnType<typeof buildBody> }>
