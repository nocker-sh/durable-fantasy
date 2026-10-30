import type { ClipData } from "#/world/scene/rig"
import { D } from "#/world/scene/rig"

/** Swap the clip library (preview tools load the full bake). */
export function setClipData(d: ClipData) {
  D.value = d
}
