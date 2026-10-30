const queue: { value: Promise<void> } = { value: Promise.resolve() }

const kept = new Set<string>()
import { memory, cacheReads } from "#/world/scene/ground"
import { obtain } from "#/world/scene/helpers/ground/obtain"
import { has } from "#/world/scene/helpers/ground/has"

/** Prefetch one map at a time. Entering a queued map starts it immediately. */
export function prefetchGround(map: string) {
  if (kept.has(map) || memory.has(map)) return
  kept.add(map)
  queue.value = queue.value
    .then(async () => {
      if (!memory.has(map) && !(await cacheReads.run(() => has(map), false))) await obtain(map, false)
    })
    .catch(() => {
      kept.delete(map)
    })
}
