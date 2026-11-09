import "#resources/components/game/game"
import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Game } from "#/world/game"
import { GameProvider } from "#/components/game/game-provider"
import { Hud } from "#/components/hud/hud"
import { useNoCanvasMenu } from "#/hooks/use-no-canvas-menu"

// the debug panel and its styles only exist in dev builds
const DebugPanel = import.meta.env.DEV ? lazy(() => import("#/dev/debug-panel")) : null

/** The game: the Game draws the world into the stage; the HUD is React over it. */
export default function HomePage() {
  const gameState = useState(() => new Game()),
    game = gameState[0]
  useNoCanvasMenu()
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stage.current) return
    game.mount(stage.current)
    // handle for poking at the game from the browser console while developing
    if (import.meta.env.DEV) Object.assign(window, { game })
    return () => game.unmount()
  }, [game])

  return (
    <GameProvider game={game}>
      <div className="fixed inset-0 overflow-hidden bg-[#0b0c15]">
        <div ref={stage} className="absolute inset-0" />
        <Hud />
        {DebugPanel && (
          <Suspense>
            <DebugPanel />
          </Suspense>
        )}
      </div>
    </GameProvider>
  )
}
