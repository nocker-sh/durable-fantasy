import { OptionalCacheAccess } from "#/lib/engine/optional-cache-access"

const cacheWrites = new OptionalCacheAccess(5000)
import type { FrameResult } from "#/world/scene/sprite.worker"
import { idle, FRAME_RETRY_MS, workers, assigned } from "#/world/scene/sprite-pool"
import { failFrame } from "#/world/scene/helpers/sprite-pool/fail-frame"
import { retireWorker } from "#/world/scene/helpers/sprite-pool/retire-worker"
import { finish } from "#/world/scene/helpers/sprite-pool/finish"

import { store } from "#/world/scene/helpers/sprite-pool/store"

export function spawnWorker(onAvailable: () => void) {
  const worker = (() => {
    try {
      return new Worker(new URL("../../sprite.worker.ts", import.meta.url), { type: "module" })
    } catch {
      setTimeout(() => spawnWorker(onAvailable), FRAME_RETRY_MS)
      return undefined
    }
  })()
  if (!worker) return
  workers.add(worker)
  worker.onerror = () => retireWorker(worker, () => spawnWorker(onAvailable))
  worker.onmessageerror = () => retireWorker(worker, () => spawnWorker(onAvailable))
  worker.onmessage = (event: MessageEvent<FrameResult>) => {
    const result = event.data
    if (!workers.has(worker) || assigned.get(worker)?.job.key !== result.key) {
      if (!("failed" in result)) result.bitmap.close()
      return
    }
    assigned.delete(worker)
    if ("failed" in result) failFrame(result.key)
    else {
      const keySource = result,
        key = keySource.key,
        bitmap = keySource.bitmap,
        png = keySource.png
      finish(key, bitmap)
      if (png) void cacheWrites.run(() => store(key, png), undefined)
    }
    idle.push(worker)
    onAvailable()
  }
  idle.push(worker)
  onAvailable()
}
