import { getNativeDiningChairError } from "#/scripts/lib/get-native-dining-chair-error"
import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedContacts } from "#/world/scene/get-seated-contacts"
import { getSeatedLegError } from "#/world/scene/get-seated-leg-error"
import type { Look } from "#/world/scene/figure/look"
import type { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
type Geometry = Exclude<ReturnType<typeof getDiningSeatGeometry>, Error>

/** Check every rendered sitting frame without retargeting the native skeleton or thinning its shoes. */
export function getNativeDiningSeatError(look: Look, geometry: Geometry): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const contacts = getSeatedContacts({ look, frame, place: geometry.place })
    if (contacts instanceof Error) return contacts
    const error = getSeatedLegError({ contacts, table: geometry.sections, floor: 0 })
    if (error) return new Error(`frame ${frame}: ${error.message}`, { cause: error })
  }

  return getNativeDiningChairError(look, geometry)
}
