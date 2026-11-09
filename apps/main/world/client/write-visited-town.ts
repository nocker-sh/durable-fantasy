import { STORAGE } from "#/world/client/identity"

/** Keep the town the room let this tab into, so a reload goes back there (the tab's own storage). */
export function writeVisitedTown(storage: Pick<Storage, "setItem">, town: number) {
  try {
    storage.setItem(`${STORAGE}/town`, String(town))
  } catch {
    // without storage a reload starts at home, as a new tab does
  }
}
