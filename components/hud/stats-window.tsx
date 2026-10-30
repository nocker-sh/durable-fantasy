// Stats (ui.md §3.9): name, level and experience, the six stats with a + each, and the
// values that follow from them.
import { STATS } from "#/world/core/growth-rules"
import { STAT_NAME } from "#/world/core/growth-rules"
import { MAX_LEVEL } from "#/world/core/growth-rules"
import { MAX_STAT } from "#/world/core/growth-rules"
import { expToNext } from "#/world/core/exp-to-next"
import { statCost } from "#/world/core/stat-cost"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Meter } from "#/components/game/meter"
import { Window } from "#/components/game/window"
import { useWindow } from "#/components/hud/use-window"

export function StatsWindow() {
  const game = useGame()
  const win = useWindow("stats")
  const player = useGameState((s) => s.player)
  const d = useGameState((s) => s.derived)
  const busy = useGameState((s) => s.busy)
  if (!win.open || !player || !d) return null
  const need = expToNext(player.level)
  const derivedRows: [string, string | number][] = [
    ["最大 HP", d.maxHp],
    ["最大 SP", d.maxSp],
    ["攻撃力", d.atk],
    ["防御", d.def],
    ["命中", d.hit],
    ["回避", d.flee],
    ["会心", `${d.crit}%`],
    ["攻撃間隔", `${(d.attackDelay / 1000).toFixed(2)} 秒`],
    ["持てる重さ", d.maxWeight],
  ]
  return (
    <Window id="stats" title="能力" hotkey="C" {...win.props} key={win.key} initial={() => ({ x: 12, y: 104 })} className="w-[340px]">
      <div className="flex items-baseline justify-between font-head">
        <span className="text-[13px]">{player.name}</span>
        <span className="text-xs text-brass-hi">
          Lv {player.level}
          <span className="text-text-faint">/{MAX_LEVEL}</span>
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 font-head text-[11px] text-text-dim">
        <span>経験値</span>
        <Meter tone="exp" value={player.exp} max={need || 1} showValue={false} className="h-[6px] flex-1" />
        <span className="tabular-nums">{need ? `${Math.floor((player.exp / need) * 100)}%` : "最大"}</span>
      </div>
      <div className="ui-rule my-2.5" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <ul className="flex flex-col gap-1">
            {STATS.map((stat) => {
              const value = player.stats[stat]
              const bonus = d.stats[stat] - value
              const cost = statCost(value)
              const can = value < MAX_STAT && player.statPoints >= cost
              return (
                <li key={stat} className="flex h-6 items-center gap-1.5 font-head text-[13px]">
                  <span className="w-10 text-text-dim">{STAT_NAME[stat]}</span>
                  <span className="flex-1 text-right whitespace-nowrap tabular-nums">
                    <span className="sr-only">{`${STAT_NAME[stat]} ${value}${bonus ? `、装備補正 ${bonus > 0 ? "+" : ""}${bonus}、合計 ${d.stats[stat]}` : ""}`}</span>
                    <span aria-hidden="true">
                      {value}
                      {bonus !== 0 && (
                        <span className="ml-1 text-brass-hi">
                          {bonus > 0 ? "+" : ""}
                          {bonus}
                        </span>
                      )}
                    </span>
                  </span>
                  <Button size="icon-sm" disabled={!can || busy} aria-label={`${STAT_NAME[stat]}を上げる`} onClick={() => game.raise(stat)} className="ml-auto">
                    +
                  </Button>
                </li>
              )
            })}
          </ul>
          <div className="mt-2 flex justify-between font-head text-xs">
            <span className="text-text-dim">残りポイント</span>
            <span className="text-brass-hi tabular-nums">{player.statPoints}</span>
          </div>
        </div>
        <dl className="flex flex-col gap-1 font-head text-xs">
          {derivedRows.map((entry) => {
            const label = entry[0]
            const value = entry[1]
            return (
              <div key={label} className="flex h-[18px] items-center justify-between">
                <dt className="text-text-dim">{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            )
          })}
        </dl>
      </div>
      <p className="mt-2 font-body text-[11px] leading-relaxed text-text-dim">能力値の横の加減算は装備の補正。装備・技の条件は補正前の能力値で判定します。</p>
    </Window>
  )
}
