// Fallen (game-system.md §8): the quiet screen, what was lost, and the way back to town.
import { deathPenalty } from "#/world/core/combat.ts"
import { expToNext } from "#/world/core/growth.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Between } from "./loading.tsx"

export function Fallen() {
  const game = useGame()
  const player = useGameState((s) => s.player)
  if (!player || player.hp > 0) return null
  const lost = deathPenalty(player.level, expToNext(player.level))
  return (
    <Between title="倒れた" passage={lost ? `経験値 ${lost} を失った` : "失ったものはない"}>
      <button type="button" onClick={() => game.revive()} className="text-[12px] tracking-[0.2em] text-[#9a968e] underline-offset-4 hover:underline">
        町へ戻る
      </button>
    </Between>
  )
}
