import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedChairFrameError } from "#/world/scene/get-seated-chair-frame-error"
import type { SeatedArmRest } from "#/world/scene/with-seated-rest-arms"
import type { Look } from "#/world/scene/figure/look"
import type { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
type Geometry = Exclude<ReturnType<typeof getDiningSeatGeometry>, Error>

/** Review each native sitting frame against the actual chair back and legs, without exempting whole body parts. */
export function getNativeDiningChairError(look: Look, geometry: Geometry, rest?: SeatedArmRest): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedNativePose({ look, frame, place: geometry.place, rest })
    if (pose instanceof Error) return pose
    const error = getSeatedChairFrameError({ look, ...pose, heading: geometry.place.heading, chair: geometry.chairSections })
    if (error) return new Error(`frame ${frame}: ${error.message}`, { cause: error })
  }

  return null
}
