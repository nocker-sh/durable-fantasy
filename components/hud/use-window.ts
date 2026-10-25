// Open state, stacking order and handlers for one of the Game's windows.
import type { WindowId } from "#/world/game.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"

export function useWindow(id: WindowId) {
  const game = useGame()
  const index = useGameState((s) => s.windows.indexOf(id))
  const layout = useGameState((s) => s.layout)
  return {
    open: index >= 0,
    /** remount key: changes when the layout is reset */
    key: `${id}-${layout}`,
    props: { z: 31 + index, onClose: () => game.closeWindow(id), onFocus: () => game.focusWindow(id) },
  }
}
