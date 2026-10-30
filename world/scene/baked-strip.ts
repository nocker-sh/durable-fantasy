import { decoded, clock, stripQueue, stripsLoading } from "#/world/scene/sprite-pool"
import { pumpStrips } from "#/world/scene/helpers/sprite-pool/pump-strips"

/**
 * A baked strip (every frame of one anim from one view, side by side). Undefined while it loads
 * (it is queued), null if it could not be loaded.
 */
export function bakedStrip(url: string, urgency: number, onReady: (strip: ImageBitmap | null) => void): ImageBitmap | null | undefined {
  const cached = decoded.get(`strip:${url}`)
  if (cached !== undefined) return cached
  const inflight = stripsLoading.get(url)
  if (inflight) {
    if (!inflight.listeners.includes(onReady)) inflight.listeners.push(onReady)
    return undefined
  }
  const score = clock.value * 1000 + urgency
  const q = stripQueue.get(url)
  if (q) {
    q.score = Math.max(q.score, score)
    if (!q.listeners.includes(onReady)) q.listeners.push(onReady)
  } else stripQueue.set(url, { url, score, listeners: [onReady] })
  pumpStrips()
  return undefined
}
