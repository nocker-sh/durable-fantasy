// Top left (ui.md §3.1): no panel, thin bars over the scene — HP, SP, stamina — and how full and warm you are.
import { useGameState } from "#/components/game/context.tsx"
import { Meter } from "#/components/game/meter.tsx"
import { uiIconUrl } from "#/world/art/icons.ts"
import { REGEN_MS, MAX_STAMINA, fullNow, settle, type PlayerState, type Rest } from "#/world/core/player.ts"
import { useEffect, useState } from "react"

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

/** HP and SP, coming back a little at a time while up and about (core/player.ts settle). */
function HpSp({ player, rest }: { player: PlayerState; rest: Rest }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), REGEN_MS / 4)
    return () => window.clearInterval(t)
  }, [])
  const p = settle(player, rest, now)
  return (
    <>
      <Meter tone="hp" value={p.hp} max={rest.maxHp} aria-label="HP" className="h-[6px]" />
      <Meter tone="sp" value={p.sp} max={rest.maxSp} aria-label="SP" className="h-[6px]" />
    </>
  )
}

/** How full you are and how long you will stay warm (game-system.md §3.6), ticking by the minute. */
function Body({ full, fullAt, warmUntil, focusUntil }: { full: number; fullAt: number; warmUntil: number; focusUntil: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    setNow(Date.now())
    const t = window.setInterval(() => setNow(Date.now()), 20_000)
    return () => window.clearInterval(t)
  }, [fullAt, warmUntil, focusUntil])
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
