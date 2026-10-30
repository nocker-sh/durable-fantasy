import { MAX_THREADS } from "#/world/core/threads"
import type { Thread } from "#/world/core/threads"

/** Replace a friend's previous thread and evict the oldest only when the retained list is full. */
export function keep(threads: readonly Thread[], thread: Thread): Thread[] {
  return [...threads.filter((previous) => previous.key !== thread.key), thread].slice(-MAX_THREADS)
}
