import { TEXT_SPEED } from "#/world/state"
import type { Dialogue } from "#/world/state"

/** Reveal the current page at the same elapsed-time rate; zero marks an already completed page. */
export function revealed(dialogue: Dialogue, now: number): number {
  const text = dialogue.pages[dialogue.page]
  if (!dialogue.shownAt) return text.length

  return Math.min(text.length, Math.floor(((now - dialogue.shownAt) / 1000) * TEXT_SPEED))
}
