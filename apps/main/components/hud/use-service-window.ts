// Stacking order and focus for a window that opens with a person or a place (ui.md §2.1, §5): it comes to
// the front when it opens and when touched, in the same order as the windows the player opens and closes.
import { useLayoutEffect } from "react"
import type { ServiceWindowId } from "#/world/state"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"

export function useServiceWindow(id: ServiceWindowId, open: boolean) {
  const game = useGame()
  const index = useGameState((s) => s.windows.indexOf(id))
  // before the paint, so a new window is never drawn under the others
  useLayoutEffect(() => {
    if (!open) return
    game.focusWindow(id)
    return () => game.unstackWindow(id)
  }, [game, id, open])
  return { z: 31 + index, onFocus: () => game.focusWindow(id) }
}
