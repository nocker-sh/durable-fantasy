// Work left with a resident craftsman (economy.md §3): what they will make, from what, for how much
// and how long; and what you have left with them, with when it will be ready.
import { useDeadlineClock } from "#/hooks/use-deadline-clock"
import { REASON_TEXT } from "#/world/core/commands"
import { countItem } from "#/world/core/count-item"
import { formatTime } from "#/world/core/format-time"
import { jstMinutes } from "#/world/core/jst-minutes"
import { COMMISSIONS } from "#/world/core/commissions"
import { MAX_ORDERS } from "#/world/core/commission-rules"
import { commissionOf } from "#/world/core/commission-of"
import { friendPrice } from "#/world/core/friend-price"
import { ITEMS } from "#/world/core/items/catalog"
import { QUALITIES } from "#/world/core/items/kinds"
import { displayName } from "#/world/core/display-name"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Gold } from "#/components/game/gold"
import { Slot } from "#/components/game/slot"
import { Window } from "#/components/game/window"
import { ItemTooltip } from "./item-tooltip"

export function CommissionWindow() {
  const game = useGame()
  const who = useGameState((s) => s.commission)
  const player = useGameState((s) => s.player)
  const busy = useGameState((s) => s.busy)
  const mine = (player?.orders ?? []).map((o, index) => ({ o, index, job: commissionOf(o.commission)! })).filter((x) => x.job?.craftsman === who)
  const until = mine.reduce((latest, inputProps) => {
    const o = inputProps.o
    return Math.max(latest, o.readyAt)
  }, 0)
  const now = useDeadlineClock(until, 10_000)
  if (!who || !player) return null
  const jobs = COMMISSIONS.filter((c) => c.craftsman === who)
  return (
    <Window id="commission" title={`${who}に頼む`} z={30} onClose={() => game.closeCommission()} initial={() => ({ x: 364, y: 104 })} className="w-[380px]">
      {mine.length > 0 && (
        <div className="mb-2.5">
          <p className="mb-1 font-head text-xs text-brass-hi">頼んである物</p>
          <ul className="flex flex-col gap-1">
            {mine.map((inputProps2) => {
              const o = inputProps2.o
              const index = inputProps2.index
              const job = inputProps2.job

              const ready = o.readyAt <= now
              return (
                <li key={index} className="ui-well flex items-center gap-2.5 p-1.5">
                  <Slot icon={game.iconUrl(job.output.item, job.craftsman)} rarity={ITEMS[job.output.item].rarity} count={job.output.count} aria-label={ITEMS[job.output.item].name} />
                  <div className="min-w-0 flex-1 font-body text-[13px]">
                    <div className="truncate">
                      {displayName(job.output.item, ITEMS[job.output.item].made ? job.craftsman : undefined)}
                      {ITEMS[job.output.item].made && <span className="ml-1 font-head text-[11px] text-brass-hi">（{QUALITIES[o.q]}）</span>}
                    </div>
                    <div className="font-head text-[11px] text-text-dim">{ready ? "できている" : `${formatTime(jstMinutes(o.readyAt))}ごろ（あと${Math.ceil((o.readyAt - now) / 60_000)}分）`}</div>
                  </div>
                  <Button variant="primary" size="sm" disabled={!ready || busy} onClick={() => game.collect(index)}>
                    受け取る
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <p className="mb-1 font-head text-xs text-brass-hi">頼める仕事（同時に{MAX_ORDERS}つまで）</p>
      <ul className="ui-scroll flex max-h-[320px] flex-col gap-1 overflow-y-auto pr-1">
        {jobs.map((job) => {
          const missing = job.inputs.some((i) => countItem(player.bag, i.item) < i.count)
          const reason = player.orders.length >= MAX_ORDERS ? "TOO_MANY_ORDERS" : missing ? "MISSING_INPUTS" : player.gold < friendPrice(job.fee, player.friends[job.craftsman] ?? 0) ? "NO_GOLD" : null
          const out = ITEMS[job.output.item]
          return (
            <li key={job.id} className="ui-well flex items-center gap-2.5 p-1.5">
              <ItemTooltip item={job.output.item} side="left">
                <Slot icon={game.iconUrl(job.output.item, job.craftsman)} rarity={out.rarity} count={job.output.count} dim={!!reason} aria-label={out.name} />
              </ItemTooltip>
              <div className="min-w-0 flex-1">
                <div className="truncate font-body text-[13px]">{out.name}</div>
                <div className="flex flex-wrap gap-x-2 font-head text-[11px] text-text-dim">
                  {job.inputs.map((i) => (
                    <span key={i.item} className={countItem(player.bag, i.item) < i.count ? "text-bad" : ""}>
                      {ITEMS[i.item].name} {countItem(player.bag, i.item)}/{i.count}
                    </span>
                  ))}
                  <span>{job.minutes >= 60 ? `${job.minutes / 60}時間` : `${job.minutes}分`}</span>
                </div>
              </div>
              <Gold amount={friendPrice(job.fee, player.friends[job.craftsman] ?? 0)} className="text-xs text-text-dim" />
              <Button variant="primary" size="sm" disabled={!!reason || busy} title={reason ? REASON_TEXT[reason] : undefined} onClick={() => game.order(job.id)}>
                頼む
              </Button>
            </li>
          )
        })}
      </ul>
    </Window>
  )
}
