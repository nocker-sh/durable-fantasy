import { useState } from "react"
// Skills (game-system.md §9, ui.md §3.10): the life skills' levels and their next milestones, what
// anyone can do (sit, first aid), and the arts of the weapon in hand. Drag an icon to the shortcut bar.
import { STAT_NAME, type Stat } from "#/world/core/growth.ts"
import { GATHER_SKILL_NAME, ITEMS, type Skill } from "#/world/core/items.ts"
import { LIFE_CAP, LIFE_MILESTONE_TEXT, LIFE_SKILLS, LIFE_TOTAL_CAP, forgottenLifeExp, lifeExpAt, lifeLevel, lifeTotal, nextMilestone } from "#/world/core/life.ts"
import type { PlayerState } from "#/world/core/player.ts"
import { SKILLS, SKILL_IDS, artBlocked, artsOf, isArt, skillOf, type SkillId } from "#/world/core/skills.ts"
import { standing } from "#/world/core/stats.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Meter } from "#/components/game/meter.tsx"
import { Window } from "#/components/game/window.tsx"
import { useWindow } from "./use-window.ts"
import { startDrag } from "./drag.ts"
import { skillIconUrl } from "./hotbar.tsx"

const KIND = { action: "動作", strike: "戦技", spell: "術", prayer: "祈り" } as const
const needName = (k: string) => (k in STAT_NAME ? STAT_NAME[k as Stat] : GATHER_SKILL_NAME[k as Skill])

export function SkillsWindow() {
  const win = useWindow("skills")
  const game = useGame()
  const busy = useGameState((s) => s.busy)
  const [forget, setForget] = useState<{ skill: Skill; exp: number } | null>(null)
  const player = useGameState((s) => s.player)
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
              <SkillRow key={id} id={id} player={player} />
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 font-head text-xs text-brass-hi">戦技と魔法</h3>
          {held.length ? (
            <ul className="flex flex-col gap-1">
              {held.map((id) => (
                <SkillRow key={id} id={id} player={player} />
              ))}
            </ul>
          ) : (
            <p className="font-body text-[12px] text-text-dim">いま手にしている武器には技がない。</p>
          )}
          <details className="mt-1.5">
            <summary className="cursor-pointer font-head text-[11px] text-text-dim">ほかの武器の技</summary>
            <ul className="mt-1 flex flex-col gap-1">
              {others.map((id) => (
                <SkillRow key={id} id={id} player={player} />
              ))}
            </ul>
          </details>
        </section>
      </div>
    </Window>
  )
}

function SkillRow({ id, player }: { id: SkillId; player: PlayerState }) {
  const game = useGame()
  const busy = useGameState((s) => s.busy)
  const sk = skillOf(id)
  const blocked = artBlocked(id, player)
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
            <Button size="sm" variant="primary" disabled={busy} onClick={() => game.toggleSit()}>
              {player.sitting ? "立つ" : "座る"}
            </Button>
          ) : sk.kind === "action" || sk.kind === "prayer" ? (
            <Button size="sm" variant="primary" disabled={busy || !!blocked} onClick={() => game.useSkill(id)}>
              使う
            </Button>
          ) : null}
        </span>
      </div>
      {isArt(sk) && (
        <div className="flex flex-wrap gap-x-2 font-head text-[11px]">
          <span className="text-text-dim">{sk.weapons.map((w) => ITEMS[w].name).join("・")}</span>
          {Object.entries(sk.needs).map(([k, n]) => (
            <span key={k} className={standing(player, k as Stat | Skill) < (n ?? 0) ? "text-bad" : ""}>
              {needName(k)} {n}
            </span>
          ))}
        </div>
      )}
      <p className="font-body text-[12px] text-text-dim">{SKILLS[id].text}</p>
    </li>
  )
}
