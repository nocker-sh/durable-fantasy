import { WORLDS } from "#/world/channels"
import { STORAGE } from "#/world/client/identity"

/** The town this tab was last let into (write-visited-town.ts), or null: a new tab or blocked storage starts at home. */
export function readVisitedTown(storage: Pick<Storage, "getItem">): number | null {
  try {
    const town = Number(storage.getItem(`${STORAGE}/town`))
    return Number.isInteger(town) && town >= 1 && town <= WORLDS ? town : null
  } catch {
    return null
  }
}
