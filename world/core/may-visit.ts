import { hometownOf } from "#/world/hometown-of"
import type { Thread } from "#/world/core/threads"

/** A player may enter their hometown or a town named by a thread they hold. */
export function mayVisit(owner: string, threads: readonly Thread[], town: number): boolean {
  return town === hometownOf(owner) || threads.some((thread) => thread.town === town)
}
