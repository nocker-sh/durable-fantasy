import { decoded, running } from "#/world/scene/sprite-pool"

export function finish(key: string, bitmap: ImageBitmap) {
  const p = running.get(key)
  running.delete(key)
  p?.listeners.forEach((fn) => fn(bitmap))
  decoded.set(`frame:${key}`, bitmap)
}
