import { getSeatedSkirtSeatError } from "#/world/scene/get-seated-skirt-seat-error"
import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedGarmentSeatError } from "#/world/scene/get-seated-garment-seat-error"
import type { Look } from "#/world/scene/figure/look"
import type { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
type Geometry = Exclude<ReturnType<typeof getDiningSeatGeometry>, Error>

/** Every native frame must keep both reviewed garment surfaces outside the same rendered seat board. */
export function getNativeDiningGarmentSeatError(look: Look, geometry: Geometry, profile: "tunic" | "skirt" = "tunic"): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedNativePose({ look, frame, place: geometry.place })
    if (pose instanceof Error) return pose
    const error = (profile === "skirt" ? getSeatedSkirtSeatError : getSeatedGarmentSeatError)({ look, ...pose, heading: geometry.place.heading, chair: geometry.chairSections })
    if (error) return new Error(`frame ${frame}: ${error.message}`, { cause: error })
  }

  return null
}
