import { seatedSupportDepth } from "#/world/scene/figure/seated-support-depth"
import { ANIMS } from "#/world/scene/figure/animation"
import type { Look } from "#/world/scene/figure/look"

/** The support plane at the underside of the widest trouser thigh, in model units. */
export function seatedSupport(look: Look): number {
  return ANIMS.sit.seatY! - seatedSupportDepth(look)
}
