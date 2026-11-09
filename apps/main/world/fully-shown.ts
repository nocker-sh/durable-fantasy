import { revealed } from "#/world/revealed"
import type { Dialogue } from "#/world/state"

export function fullyShown(dialogue: Dialogue): boolean {
  return revealed(dialogue, performance.now()) >= dialogue.pages[dialogue.page].length
}
