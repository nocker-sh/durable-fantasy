import { hometownOf } from "#/world/hometown-of"
import { threadKey } from "#/world/core/thread-key"
import type { Thread } from "#/world/core/threads"

/** A received thread carries its existing public mark, name and hometown. */
export function threadOf(owner: string, name: string, at: number): Thread {
  return { key: threadKey(owner), name, town: hometownOf(owner), at }
}
