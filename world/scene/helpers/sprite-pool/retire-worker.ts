import { idle, FRAME_RETRY_MS, workers, assigned } from "#/world/scene/sprite-pool"
import { failFrame } from "#/world/scene/helpers/sprite-pool/fail-frame"

/** Each lost slot schedules one replacement, even if several error events arrive. */
export function retireWorker(worker: Worker, replacement: () => void) {
  if (!workers.delete(worker)) return
  const index = idle.indexOf(worker)
  if (index !== -1) idle.splice(index, 1)
  const job = assigned.get(worker)
  assigned.delete(worker)
  if (job) failFrame(job.job.key)
  worker.terminate()
  setTimeout(replacement, FRAME_RETRY_MS)
}
