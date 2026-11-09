import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { GROUND_PX } from "#/world/scene/terrain"
import { GROUND_VERSION as VERSION } from "#/world/scene/ground-version"
import { STORE } from "#/world/scene/ground"
import { db } from "#/world/scene/helpers/ground/db"
import { loadFields } from "#/world/scene/helpers/ground/load-fields"

export async function load(map: string): Promise<PixBuf | null> {
  const d = await db()
  if (!d) return null
  await loadFields(d, map)
  const data = await new Promise<Uint8ClampedArray | null>((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).get(`${map}:${VERSION}`)
    req.onsuccess = () => resolve((req.result as Uint8ClampedArray | undefined) ?? null)
    req.onerror = () => resolve(null)
  })
  if (!data || data.length !== GROUND_PX * GROUND_PX * 4) return null
  const buf = new PixBuf(GROUND_PX, GROUND_PX)
  buf.data.set(data)
  return buf
}
