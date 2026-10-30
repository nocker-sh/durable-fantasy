const FAILED_FRAMES = 512
import { running, failedUntil, FRAME_RETRY_MS } from "#/world/scene/sprite-pool"

export function failFrame(key: string) {
  running.delete(key)
  failedUntil.delete(key)
  failedUntil.set(key, performance.now() + FRAME_RETRY_MS)
  if (failedUntil.size > FAILED_FRAMES) failedUntil.delete(failedUntil.keys().next().value!)
}
