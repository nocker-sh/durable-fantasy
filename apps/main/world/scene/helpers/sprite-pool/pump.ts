import { OptionalCacheAccess } from "#/lib/engine/optional-cache-access"

const cacheReads = new OptionalCacheAccess(5000)
import { spawnWorker } from "#/world/scene/helpers/sprite-pool/spawn-worker"
import { pending, running, idle, assigned } from "#/world/scene/sprite-pool"
import type { Pending } from "#/world/scene/sprite-pool"
import { retireWorker } from "#/world/scene/helpers/sprite-pool/retire-worker"
import { finish } from "#/world/scene/helpers/sprite-pool/finish"
import { load } from "#/world/scene/helpers/sprite-pool/load"

/** Hand the most urgent waiting frames to free workers, after checking IndexedDB for each. */
export function pump() {
  while (idle.length && pending.size) {
    const best: { value: Pending | null } = { value: null }
    for (const p of pending.values()) if (!best.value || p.score > best.value.score) best.value = p
    const p = best.value!
    pending.delete(p.job.key)
    running.set(p.job.key, p)
    const worker = idle.pop()!
    assigned.set(worker, p)
    void cacheReads
      .run(
        () => load(p.job.key),
        null,
        (bitmap) => bitmap?.close(),
      )
      .then((bitmap) => {
        // The worker may have failed while its cache read was pending.
        if (assigned.get(worker) !== p) {
          bitmap?.close()
          return
        }
        if (bitmap) {
          assigned.delete(worker)
          idle.push(worker)
          finish(p.job.key, bitmap)
          pump()
        } else {
          try {
            worker.postMessage(p.job)
          } catch {
            retireWorker(worker, () => spawnWorker(pump))
          }
        }
      })
  }
}
