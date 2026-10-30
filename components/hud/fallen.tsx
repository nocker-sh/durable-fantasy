// Fallen (game-system.md §8): the quiet screen, what was lost, and the way back to town.
import { deathPenalty } from "#/world/core/death-penalty"
import { expToNext } from "#/world/core/exp-to-next"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Between } from "#/components/hud/between"

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
