import { GROUND_VERSION as VERSION } from "#/world/scene/ground-version"
import { STORE } from "#/world/scene/ground"
import { db } from "#/world/scene/helpers/ground/db"

/** Check saved prefetches without decoding their full-size pixel buffers. */
export async function has(map: string): Promise<boolean> {
  const d = await db()
  if (!d) return false
  return new Promise((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).count(`${map}:${VERSION}`)
    req.onsuccess = () => resolve(req.result > 0)
    req.onerror = () => resolve(false)
  })
}
