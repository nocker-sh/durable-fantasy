import type { Stack } from "#/world/core/bag-types"
import type { GameEvent } from "#/world/core/commands"

/** 受渡しのイベントから、実際に取り出した品を読む。 */
export function takenOf(events: readonly GameEvent[]): Stack[] {
  const outgoing = events.find((event) => event.type === "traded-out")

  return outgoing ? outgoing.stacks : []
}
