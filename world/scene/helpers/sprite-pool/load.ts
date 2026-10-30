import { SPRITE_RENDER_VERSION } from "#/world/scene/sprite-render-version"
import { open } from "#/world/scene/helpers/sprite-pool/open"

export async function load(key: string): Promise<ImageBitmap | null> {
  const d = await open()
  if (!d) return null
  const blob = await new Promise<Blob | undefined>((resolve) => {
    const req = d.transaction("frames").objectStore("frames").get(`${SPRITE_RENDER_VERSION}|${key}`)
    req.onsuccess = () => resolve(req.result as Blob | undefined)
    req.onerror = () => resolve(undefined)
  })
  return blob ? createImageBitmap(blob).catch(() => null) : null
}
