// The way to the room is lost (the socket closed); it is made again on its own.
import { useGameState } from "#/hooks/use-game-state"
import { Between } from "#/components/hud/between"

export function Offline() {
  const offline = useGameState((s) => s.online === "offline")
  const loading = useGameState((s) => !!s.loading)
  const replaced = useGameState((s) => s.connectionReplaced)
  const outdated = useGameState((s) => s.outdated)
  // taken over by another screen: say so even while a map was still loading, which would never finish now
  if (offline && replaced)
    return (
      <Between title="別の画面で開かれた">
        <button type="button" onClick={() => location.reload()} className="text-sm text-[#d8d4cc]">
          この画面で再開
        </button>
      </Between>
    )
  // the room runs a newer build and turns this page's messages away: no reconnection helps, a reload does
  if (outdated)
    return (
      <Between title="新しい版になった">
        <button type="button" onClick={() => location.reload()} className="text-sm text-[#d8d4cc]">
          読み込み直す
        </button>
      </Between>
    )
  if (!offline || loading) return null
  return <Between title="つなぎ直しています" />
}
