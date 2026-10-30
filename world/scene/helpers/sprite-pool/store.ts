import { SPRITE_RENDER_VERSION } from "#/world/scene/sprite-render-version"
import { open } from "#/world/scene/helpers/sprite-pool/open"

export async function store(key: string, png: Blob) {
  const d = await open()
  d?.transaction("frames", "readwrite").objectStore("frames").put(png, `${SPRITE_RENDER_VERSION}|${key}`)
}
