// The way to the room is lost (the socket closed); it is made again on its own.
import { useGameState } from "#/components/game/context.tsx"
import { Between } from "./loading.tsx"

export function Offline() {
  const lost = useGameState((s) => s.online === "offline" && !s.loading)
  if (!lost) return null
  return <Between title="つなぎ直しています" />
}
