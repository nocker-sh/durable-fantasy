// A station's recipes (economy.md §2), opened by walking up to the hearth, workbench, loom or forge:
// what each makes, what it takes and whether you have it, the life skill level it needs and the fee.
import { REASON_TEXT } from "#/world/core/commands.ts"
import { countItem } from "#/world/core/bag.ts"
import { RECIPES, STAMINA_PER_CRAFT, stationOf } from "#/world/core/crafting.ts"
import { GATHER_SKILL_NAME, ITEMS } from "#/world/core/items.ts"
import { LIFE_CAP, lifeLevel } from "#/world/core/life.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Gold } from "#/components/game/gold.tsx"
import { Slot } from "#/components/game/slot.tsx"
import { Window } from "#/components/game/window.tsx"
import { ItemTooltip } from "./item-tooltip.tsx"

export function CraftWindow() {
  const game = useGame()
  const id = useGameState((s) => s.craft)
  const player = useGameState((s) => s.player)
  const busy = useGameState((s) => s.busy)
  const station = id ? stationOf(id) : undefined
  if (!station || !player) return null
  // what only the levels past the cap can make is not shown yet (economy.md §2.1)
  const recipes = RECIPES.filter((r) => r.station === station.kind && r.min <= LIFE_CAP)
  return (
    <Window
      id="craft"
      title={station.name}
      z={30}
      onClose={() => game.closeCraft()}
      initial={() => ({ x: 364, y: 104 })}
      className="w-[380px]"
      footer={
        <div className="flex items-center justify-between font-head text-xs text-text-dim">
          <span>
            使用料 <Gold amount={station.fee} className="text-text" /> ・ スタミナ {STAMINA_PER_CRAFT}
          </span>
          <span>
            所持金 <Gold amount={player.gold} className="text-text" />
          </span>
        </div>
      }
    >
      <ul className="ui-scroll flex max-h-[380px] flex-col gap-1 overflow-y-auto pr-1">
        {recipes.map((r) => {
          const skill = lifeLevel(player.life[r.skill])
          const missing = r.inputs.some((i) => countItem(player.bag, i.item) < i.count)
          const reason = skill < r.min ? "NOT_SKILLED" : missing ? "MISSING_INPUTS" : player.gold < station.fee ? "NO_GOLD" : player.stamina < STAMINA_PER_CRAFT ? "EXHAUSTED" : null
          const out = ITEMS[r.output.item]
          return (
            <li key={r.id} className="ui-well flex items-center gap-2.5 p-1.5">
              <ItemTooltip item={r.output.item} side="left">
                <Slot icon={game.iconUrl(r.output.item)} rarity={out.rarity} count={r.output.count} dim={!!reason} aria-label={out.name} />
              </ItemTooltip>
              <div className="min-w-0 flex-1">
                <div className="truncate font-body text-[13px]">{out.name}</div>
                <div className="flex flex-wrap gap-x-2 font-head text-[11px] text-text-dim">
                  {r.inputs.map((i) => {
                    const have = countItem(player.bag, i.item)
                    return (
                      <span key={i.item} className={have < i.count ? "text-bad" : ""}>
                        {ITEMS[i.item].name} {have}/{i.count}
                      </span>
                    )
                  })}
                  {r.min > 0 && (
                    <span className={skill < r.min ? "text-bad" : ""}>
                      {GATHER_SKILL_NAME[r.skill]} Lv {r.min}〜
                    </span>
                  )}
                </div>
              </div>
              <Button variant="primary" size="sm" disabled={!!reason || busy} title={reason ? REASON_TEXT[reason] : undefined} onClick={() => game.craft(r.id)}>
                作る
              </Button>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 font-body text-[11px] text-text-faint">{GATHER_SKILL_NAME[recipes[0]?.skill ?? "cooking"]}の腕は作るほど上がる。作った物には、あなたの名前が付く。</p>
    </Window>
  )
}
