import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { CraftWindow } from "#/components/hud/craft-window"
import { Game } from "#/world/game"
import { apply } from "#/world/core/apply"
import { REASON_TEXT, type Reason } from "#/world/core/commands"
import { STAMINA_PER_CRAFT, STATION_RULES } from "#/world/core/crafting-rules"
import { LIFE_CAP } from "#/world/core/life-rules"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { RECIPES } from "#/world/core/recipes/catalog"
import type { Recipe } from "#/world/core/recipes/definition"
import type { PlayerState } from "#/world/core/player-types"
import { ITEMS } from "#/world/core/items/catalog"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"

// Image encoding is an output boundary; the game, hooks, window and craft rules stay real.
vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

function buttonFor(game: Game, recipe: Recipe, station: string): string {
  const visible = RECIPES.filter((entry) => entry.station === recipe.station && entry.min <= LIFE_CAP)
  const html = renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(CraftWindow) }))
  const rows = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)]
  expect(rows.length, station).toBe(visible.length)
  const row = rows[visible.findIndex((entry) => entry.id === recipe.id)]
  expect(row?.[1]).toContain(`aria-label="${ITEMS[recipe.output.item].name}"`)
  const button = [...row[1].matchAll(/<button\b([^>]*)>[\s\S]*?<\/button>/g)].find((match) => match[0].includes(">作る<"))
  if (!button) throw new Error(`${recipe.id}: the real craft window has no craft button`)
  return button[1]
}

it.each(RECIPES.filter((recipe) => recipe.min <= LIFE_CAP))("$id: real craft output and command agree on readiness and refusal priority", (recipe) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const station = STATION_RULES.find((entry) => entry.kind === recipe.station)!
  expect(station).toBeDefined()
  const base = player()
  // Skill, fee and one batch of inputs are local starting conditions, not a collection route.
  const ready = player({
    profileComplete: true,
    gold: station.fee,
    stamina: STAMINA_PER_CRAFT,
    stats: { ...base.stats, str: 40 },
    life: { ...base.life, [recipe.skill]: lifeExpAt(recipe.min) },
    bag: bagWith(...recipe.inputs.map((input): Parameters<typeof bagWith>[number] => [input.item, input.count])),
  })
  const cases: Array<{ label: string; state: PlayerState; reason: Reason | null }> = [
    { label: "exact requirements", state: ready, reason: null },
    { label: "fee shortage", state: { ...ready, gold: station.fee - 1 }, reason: "NO_GOLD" },
    { label: "stamina shortage", state: { ...ready, stamina: STAMINA_PER_CRAFT - 1 }, reason: "EXHAUSTED" },
  ]
  for (const input of recipe.inputs) {
    const bag = bagWith(...recipe.inputs.map((entry): Parameters<typeof bagWith>[number] => [entry.item, entry.count - (entry === input ? 1 : 0)]).filter((entry) => entry[1] > 0))
    cases.push(
      { label: `${input.item}: shortage`, state: { ...ready, bag }, reason: "MISSING_INPUTS" },
      { label: `${input.item}: shortage and no fee`, state: { ...ready, bag, gold: station.fee - 1 }, reason: "NO_GOLD" },
      { label: `${input.item}: shortage and no stamina`, state: { ...ready, bag, stamina: 0 }, reason: "EXHAUSTED" },
    )
  }
  if (recipe.min > 0)
    cases.push({ label: "skill below the threshold", state: { ...ready, life: { ...ready.life, [recipe.skill]: lifeExpAt(recipe.min - 1) }, gold: 0, stamina: 0 }, reason: "NOT_SKILLED" })
  for (const scenario of cases) {
    const before = structuredClone(scenario.state)
    const game = new Game()
    game.state.set((state) => ({ ...state, player: scenario.state, craft: station.id, online: "online" }))
    const button = buttonFor(game, recipe, station.id)
    expect(/(?:^|\s)disabled(?:=|\s|$)/.test(button), scenario.label).toBe(scenario.reason !== null)
    const result = apply(scenario.state, { type: "craft", recipe: recipe.id, station: station.id, roll: 0.5 })
    expect(result.ok ? null : result.reason, scenario.label).toBe(scenario.reason)
    if (scenario.reason) {
      expect(button, scenario.label).toContain(`title="${REASON_TEXT[scenario.reason]}"`)
      expect(result).toEqual({ ok: false, reason: scenario.reason })
    }
    expect(scenario.state).toEqual(before)
    expect(game.state.get().player).toEqual(before)
  }
})
