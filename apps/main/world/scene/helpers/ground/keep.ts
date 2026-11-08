import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { GROUND_VERSION as VERSION } from "#/world/scene/ground-version"
import { STORE } from "#/world/scene/ground"
import { db } from "#/world/scene/helpers/ground/db"

export async function keep(map: string, buf: PixBuf) {
  const d = await db()
  if (!d) return
  const tx = d.transaction(STORE, "readwrite")
  const done = new Promise<void>((resolve) => {
    tx.oncomplete = () => resolve()
    tx.onerror = tx.onabort = () => resolve()
  })
  const store = tx.objectStore(STORE)
  // only this version is kept: older pictures of every map go
  const all = store.getAllKeys()
  all.onsuccess = () => {
    for (const k of all.result) if (!String(k).includes(`:${VERSION}`)) store.delete(k)
    store.put(buf.data, `${map}:${VERSION}`)
  }
  await done
}
