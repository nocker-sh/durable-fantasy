// Top left (ui.md §3.1): no panel, thin bars over the scene — HP, SP, stamina — and how full and warm you are.
import { useGameState } from "#/hooks/use-game-state"
import { Meter } from "#/components/game/meter"
import { uiIconUrl } from "#/world/art/ui-icon-url"
import { REGEN_MS } from "#/world/core/player-rules"
import { DIGEST_MS } from "#/world/core/player-rules"
import { MAX_STAMINA } from "#/world/core/player-rules"
import { fullNow } from "#/world/core/full-now"
import { settle } from "#/world/core/settle"
import type { PlayerState } from "#/world/core/player-types"
import type { Rest } from "#/world/core/player-types"
import { useEffect, useState } from "react"
import { useDeadlineClock } from "#/hooks/use-deadline-clock"

export function StatusFrame() {
  const player = useGameState((s) => s.player)
  const derived = useGameState((s) => s.derived)
  if (!player || !derived) return null
  // no panel: thin bars straight over the scene (ui.md §3.1)
  return (
    <div className="pointer-events-auto absolute top-4 left-4 flex w-[268px] flex-col gap-1.5">
      <HpSp player={player} rest={derived} />
      <Meter tone="stamina" value={player.stamina} max={MAX_STAMINA} aria-label="スタミナ" className="h-[4px]" />
      <Body full={player.full} fullAt={player.fullAt} warmUntil={player.warmUntil} focusUntil={player.focusUntil} />
    </div>
  )
}

/** HP and SP, coming back a little at a time while up and about (core/settle.ts). */
function HpSp(inputProps: { player: PlayerState; rest: Rest }) {
  const player = inputProps.player
  const rest = inputProps.rest

  const nowState = useState(() => Date.now()),
    now = nowState[0],
    setNow = nowState[1]
  const p = settle(player, rest, Math.max(now, Date.now()))
  const recovering = p.hp > 0 && (p.hp < rest.maxHp || p.sp < rest.maxSp)
  useEffect(() => {
    if (!recovering) return
    const timer = setTimeout(() => setNow(Date.now()), REGEN_MS / 4)
    return () => clearTimeout(timer)
  }, [recovering, now])
  return (
    <>
      <Meter tone="hp" value={p.hp} max={rest.maxHp} aria-label="HP" className="h-[6px]" />
      <Meter tone="sp" value={p.sp} max={rest.maxSp} aria-label="SP" className="h-[6px]" />
    </>
  )
}

/** How full you are and how long you will stay warm (game-system.md §3.6), ticking by the minute. */
function Body(inputProps2: { full: number; fullAt: number; warmUntil: number; focusUntil: number }) {
  const full = inputProps2.full
  const fullAt = inputProps2.fullAt
  const warmUntil = inputProps2.warmUntil
  const focusUntil = inputProps2.focusUntil

  const until = Math.max(full > 0 ? fullAt + full * DIGEST_MS : 0, warmUntil, focusUntil)
  const now = useDeadlineClock(until, 20_000)
  const f = fullNow({ full, fullAt }, now)
  const focus = Math.max(0, Math.ceil((focusUntil - now) / 60_000))
  const warm = Math.max(0, Math.ceil((warmUntil - now) / 60_000))
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-3 font-head text-[11px] leading-none text-text-dim ui-text-shadow">
      <span className="flex items-center gap-1" title="満腹（食べ過ぎると食べられない）">
        <img src={uiIconUrl("full", 14)} alt="" className="size-[14px]" />
        {f >= 80 ? "満腹" : f >= 40 ? "腹八分" : f > 0 ? "小腹" : "空腹"}
      </span>
      <span className={warm ? "flex items-center gap-1 text-[#f0b060]" : "flex items-center gap-1 opacity-60"} title="温まり（外の寒さでスタミナが余計に減らない）">
        <img src={uiIconUrl("warm", 14)} alt="" className={warm ? "size-[14px]" : "size-[14px] grayscale"} />
        {warm ? `温まっている ${warm}分` : "冷えている"}
      </span>
      {focus > 0 && (
        <span className="text-good" title="集中（SPの自然回復量 +1）">
          集中 {focus}分
        </span>
      )}
    </div>
  )
}
