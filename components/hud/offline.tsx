// The way to the room is lost (the socket closed); it is made again on its own.
import { useGameState } from "#/hooks/use-game-state"
import { Between } from "#/components/hud/between"

export function Offline() {
  const lost = useGameState((s) => s.online === "offline" && !s.loading)
  const replaced = useGameState((s) => s.connectionReplaced)
  if (!lost) return null
  if (replaced)
    return (
      <Between title="別の画面で開かれました">
        <button type="button" onClick={() => location.reload()} className="text-sm text-[#d8d4cc]">
          この画面で再開
        </button>
      </Between>
    )
  return <Between title="つなぎ直しています" />
}
