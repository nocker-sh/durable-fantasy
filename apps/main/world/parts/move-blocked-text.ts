import type { GameState } from "#/world/state"

/**
 * Why the channel or the town cannot be changed now, or null. A conversation, a shop (and the windows
 * opened from talking: work for a craftsman, the warehouse) or a trade belongs to this room, and
 * leaving it would end them (ui.md §3.25, game-system.md §11).
 */
export function moveBlockedText(state: Pick<GameState, "dialogue" | "shop" | "commission" | "storage" | "trade">): string | null {
  if (state.trade) return "取引の最中は移れない。"
  if (state.dialogue || state.shop || state.commission || state.storage) return "会話や店の最中は移れない。"
  return null
}
