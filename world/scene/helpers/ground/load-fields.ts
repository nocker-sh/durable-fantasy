import { hasFields } from "#/world/scene/has-fields"
import { primeFields } from "#/world/scene/prime-fields"
import type { Fields } from "#/world/maps/ground/types"
import { layoutOf } from "#/world/maps/layouts"
import { GROUND_VERSION as VERSION } from "#/world/scene/ground-version"
import { STORE } from "#/world/scene/ground"

/** The plan's fields kept with its ground, put where setLayout finds them. */
export function loadFields(d: IDBDatabase, map: string): Promise<void> {
  const l = layoutOf(map)
  if (hasFields(l)) return Promise.resolve()
  return new Promise((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).get(`${map}:${VERSION}:fields`)
    req.onsuccess = () => {
      if (req.result) primeFields(l, req.result as Fields)
      resolve()
    }
    req.onerror = () => resolve()
  })
}
