import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"

/** 外した枠の印だけを、新しい記録から取り除く。 */
export function withoutWornSlot(worn: PlayerState["worn"], slot: Slot): PlayerState["worn"] {
  const next = { ...worn }
  delete next[slot]

  return next
}
