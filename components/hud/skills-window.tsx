import { useState } from "react"
import { useDeadlineClock } from "#/hooks/use-deadline-clock"
import { apply } from "#/world/core/apply"
import { REASON_TEXT } from "#/world/core/commands"
// Skills (game-system.md §9, ui.md §3.10): the life skills' levels and their next milestones, what
// anyone can do (sit, first aid), and the arts of the weapon in hand. Drag an icon to the shortcut bar.
import { STAT_NAME } from "#/world/core/growth-rules"
import type { Stat } from "#/world/core/growth-types"
import { GATHER_SKILL_NAME } from "#/world/core/items/kinds"
import { ITEMS } from "#/world/core/items/catalog"
import type { Skill } from "#/world/core/items/kinds"
import { LIFE_CAP, LIFE_MILESTONE_TEXT, LIFE_SKILLS, LIFE_TOTAL_CAP } from "#/world/core/life-rules"
import { forgottenLifeExp } from "#/world/core/forgotten-life-exp"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { lifeLevel } from "#/world/core/life-level"
import { lifeTotal } from "#/world/core/life-total"
import { nextMilestone } from "#/world/core/next-milestone"
import type { PlayerState } from "#/world/core/player-types"
import { SKILLS } from "#/world/core/skills"
import { SKILL_IDS } from "#/world/core/skill-ids"
import { artsOf } from "#/world/core/arts-of"
import { isArt } from "#/world/core/is-art"
import { skillOf } from "#/world/core/skill-of"
import type { SkillId } from "#/world/core/skill-types"
import { standing } from "#/world/core/standing"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Meter } from "#/components/game/meter"
import { Window } from "#/components/game/window"
import { useWindow } from "./use-window"
import { startDrag } from "#/components/hud/start-drag"
import { skillIconUrl } from "./skill-icon"

const KIND = { action: "動作", strike: "戦技", spell: "術", prayer: "祈り" } as const
const needName = (k: string) => (k in STAT_NAME ? STAT_NAME[k as Stat] : GATHER_SKILL_NAME[k as Skill])

export function SkillsWindow() {
  const win = useWindow("skills")
  const game = useGame()
  const busy = useGameState((s) => s.busy)
  const forgetState = useState<{ skill: Skill; exp: number } | null>(null),
    forget = forgetState[0],
    setForget = forgetState[1]
  const player = useGameState((s) => s.player)
  // Recovery can make a skill usable even when there is no cooldown pending.
  const now = useDeadlineClock(win.open ? Infinity : 0)
  if (!win.open || !player) return null
  const total = lifeTotal(player.life)
  const held = artsOf(player.equipment.weapon)
  const others = SKILL_IDS.filter((id) => isArt(skillOf(id)) && !held.includes(id))
  return (
    <Window id="skills" title="スキル" hotkey="K" {...win.props} key={win.key} initial={(w) => ({ x: Math.max(12, w / 2 - 190), y: 96 })} className="w-[380px]">
      <div className="ui-scroll flex max-h-[480px] flex-col gap-3 overflow-y-auto pr-1">
        <section>
          <h3 className="mb-1 flex items-baseline justify-between font-head text-xs">
            <span className="text-brass-hi">生活スキル</span>
            <span className={total >= LIFE_TOTAL_CAP ? "text-bad" : "text-text-dim"}>
              合計 {total} / {LIFE_TOTAL_CAP}
            </span>
          </h3>
          <ul className="flex flex-col gap-1">
            {LIFE_SKILLS.map((s) => {
              const exp = player.life[s] ?? 0,
                lv = lifeLevel(exp)
              const from = lifeExpAt(lv),
                to = lifeExpAt(lv + 1)
              const next = nextMilestone(lv)
              return (
                <li key={s} className="ui-well flex flex-col gap-0.5 px-2 py-1">
                  <div className="flex items-baseline gap-2 font-head text-[12px]">
                    <span className="w-14">{GATHER_SKILL_NAME[s]}</span>
                    <span className="w-14 tabular-nums text-brass-hi">
                      Lv {lv}
                      <span className="text-text-faint">/{LIFE_CAP}</span>
                    </span>
                    <Meter
                      tone="exp"
                      value={lv >= LIFE_CAP ? 1 : exp - from}
                      max={lv >= LIFE_CAP ? 1 : to - from}
                      showValue={false}
                      className="h-[5px] flex-1"
                      aria-label={`${GATHER_SKILL_NAME[s]}の経験`}
                    />
                  </div>
                  {exp > 0 && (
                    <Button size="sm" variant="ghost" className="self-end" disabled={busy} onClick={() => setForget({ skill: s, exp })}>
                      忘れる
                    </Button>
                  )}
                  {forget?.skill === s && (
                    <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-2 font-body text-xs" role="group" aria-label={`${GATHER_SKILL_NAME[s]}を忘れる確認`}>
                      <p>
                        {GATHER_SKILL_NAME[s]}を Lv {lifeLevel(forget.exp)} → {lifeLevel(forgottenLifeExp(forget.exp))} に下げ、経験 {forget.exp - forgottenLifeExp(forget.exp)}{" "}
                        を失う。元には戻せないが、作業で育て直せる。
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={async () => {
                            if (await game.forgetLife(forget.skill, forget.exp)) setForget(null)
                          }}
                        >
                          経験を失って忘れる
                        </Button>
                        <Button size="sm" disabled={busy} onClick={() => setForget(null)}>
                          やめる
                        </Button>
                      </div>
                    </div>
                  )}
                  {next && (
                    <p className="font-body text-[11px] text-text-dim">
                      Lv {next}: {LIFE_MILESTONE_TEXT[s][next]}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="mt-1 font-body text-[11px] text-text-faint">
            道具があれば誰でもできる。採るほど、作るほど上がる。合計が {LIFE_TOTAL_CAP} に届くと、どれも上がらなくなる。専門を変えたいときは、経験を忘れて合計に空きを作れる。
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-head text-xs text-brass-hi">動作</h3>
          <ul className="flex flex-col gap-1">
            {(["sit", "first-aid"] as const).map((id) => (
              <SkillRow key={id} id={id} player={player} now={now} />
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 font-head text-xs text-brass-hi">戦技と魔法</h3>
          <p className="mb-1 font-body text-[11px] text-text-dim">戦技・術は、生き物をクリックして戦い始めてから使う。アイコンをショートカットバーへドラッグしても使える。</p>
          {held.length ? (
            <ul className="flex flex-col gap-1">
              {held.map((id) => (
                <SkillRow key={id} id={id} player={player} now={now} />
              ))}
            </ul>
          ) : (
            <p className="font-body text-[12px] text-text-dim">いま手にしている武器には技がない。</p>
          )}
          <details className="mt-1.5">
            <summary className="cursor-pointer font-head text-[11px] text-text-dim">ほかの武器の技</summary>
            <ul className="mt-1 flex flex-col gap-1">
              {others.map((id) => (
                <SkillRow key={id} id={id} player={player} now={now} />
              ))}
            </ul>
          </details>
        </section>
      </div>
    </Window>
  )
}

function SkillRow(inputProps: { id: SkillId; player: PlayerState; now: number }) {
  const id = inputProps.id
  const player = inputProps.player
  const now = inputProps.now

  const game = useGame()
  const busy = useGameState((s) => s.busy)
  const sk = skillOf(id)
  const preview = apply(player, id === "sit" ? { type: player.sitting ? "stand" : "sit" } : sk.kind === "strike" || sk.kind === "spell" ? { type: "art", skill: id } : { type: "cast", skill: id }, {
    now,
  })
  const blocked = preview.ok ? null : preview.reason
  const seconds = Math.max(0, Math.ceil(((player.ready[id] ?? 0) - now) / 1000))
  const icon = skillIconUrl(id)
  return (
    <li className="ui-well flex flex-col gap-1 p-2">
      <div className="flex items-center gap-2">
        <img src={icon} alt="" draggable title="ショートカットバーへドラッグ" onDragStart={(e) => startDrag(e, { skill: id }, icon)} className={`size-6 cursor-grab ${blocked ? "opacity-40" : ""}`} />
        <span className="font-body text-[13px]">{sk.name}</span>
        <span className="font-head text-[11px] text-text-dim">
          {KIND[sk.kind]}
          {sk.sp ? ` ・ SP ${sk.sp}` : ""}
        </span>
        <span className="ml-auto">
          {id === "sit" ? (
            <Button size="sm" variant="primary" disabled={busy || !!blocked} onClick={() => game.toggleSit()}>
              {player.sitting ? "立つ" : "座る"}
            </Button>
          ) : (
            <Button size="sm" variant="primary" disabled={busy || !!blocked || seconds > 0} onClick={() => game.useSkill(id)}>
              {seconds > 0 ? `あと${seconds}秒` : "使う"}
            </Button>
          )}
        </span>
      </div>
      {isArt(sk) && (
        <div className="flex flex-wrap gap-x-2 font-head text-[11px]">
          <span className="text-text-dim">{sk.weapons.map((w) => ITEMS[w].name).join("・")}</span>
          {Object.entries(sk.needs).map((entry) => {
            const k = entry[0]
            const n = entry[1]
            return (
              <span key={k} className={standing(player, k as Stat | Skill) < (n ?? 0) ? "text-bad" : ""}>
                {needName(k)} {n}
              </span>
            )
          })}
        </div>
      )}
      <p className="font-body text-[12px] text-text-dim">{SKILLS[id].text}</p>
      {blocked && <p className="font-body text-[11px] text-bad">{REASON_TEXT[blocked]}</p>}
    </li>
  )
}
