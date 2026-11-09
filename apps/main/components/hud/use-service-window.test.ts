import { createElement, Fragment } from "react"
import type { FunctionComponent } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it, vi } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { CommissionWindow } from "#/components/hud/commission-window"
import { CraftWindow } from "#/components/hud/craft-window"
import { DialogueBox } from "#/components/hud/dialogue"
import { ExchangeWindow } from "#/components/hud/exchange-window"
import { PartyAsk } from "#/components/hud/party-ask"
import { PlayerMenu } from "#/components/hud/player-menu"
import { ShopWindow } from "#/components/hud/shop-window"
import { SkillsWindow } from "#/components/hud/skills-window"
import { StorageWindow } from "#/components/hud/storage-window"
import { ThreadAsk } from "#/components/hud/thread-ask"
import { TradeAsk } from "#/components/hud/trade-ask"
import { TradeWindow } from "#/components/hud/trade-window"
import { COMMISSIONS } from "#/world/core/commissions"
import { STATION_RULES } from "#/world/core/crafting-rules"
import { Game } from "#/world/game"
import { DEFAULT_WINDOWS, SERVICE_WINDOWS } from "#/world/state"
import type { GameState, ServiceWindowId, WindowId } from "#/world/state"
import { player } from "#/world/test/player"

// Image encoding is a browser boundary; the game, its state, the hooks and the windows stay real.
vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))

const side = { stacks: [], gold: 0, locked: false, done: false }
const SHOWN: Record<ServiceWindowId, { view: FunctionComponent; state: Partial<GameState> }> = {
  shop: { view: ShopWindow, state: { shop: "fruit" } },
  craft: { view: CraftWindow, state: { craft: STATION_RULES[0].id } },
  commission: { view: CommissionWindow, state: { commission: COMMISSIONS[0].craftsman } },
  storage: { view: StorageWindow, state: { storage: true } },
  exchange: { view: ExchangeWindow, state: { board: { symbol: "apple", view: null } } },
  trade: { view: TradeWindow, state: { trade: { with: "p2", name: "アグネス", mine: side, lots: [], theirs: side } } },
}
const TOGGLED: readonly WindowId[] = ["minimap", "chat", "syslog", "inventory", "equipment", "stats", "worldmap", "errands", "skills", "friends"]

function render(views: readonly FunctionComponent[], state: Partial<GameState>) {
  const game = new Game()
  game.state.set((s) => ({ ...s, player: player({ profileComplete: true }), online: "online", ...state }))
  return renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(Fragment, null, ...views.map((view) => createElement(view))) }))
}

/** The stacking value of each drawn window, by its name. */
function stacking(html: string) {
  return new Map([...html.matchAll(/<section[^>]*aria-label="([^"]*)"[^>]*data-slot="window"[^>]*z-index:(\d+)/g)].map((match) => [match[1], Number(match[2])]))
}

/** The stacking value a panel takes from its z- class. */
const zClass = (html: string) => Number(/class="(?:[^"]*\s)?z-\[?(\d+)\]?[\s"]/.exec(html)?.[1])

it.each(SERVICE_WINDOWS)("%s: comes to the front when shown and goes behind a window touched after it (ui.md §2.1, §5)", (id) => {
  const shown = SHOWN[id]
  for (const windows of [
    [...DEFAULT_WINDOWS, "inventory", "skills", id],
    [...DEFAULT_WINDOWS, "inventory", id, "skills"],
  ] satisfies GameState["windows"][]) {
    const z = stacking(render([shown.view, SkillsWindow], { ...shown.state, windows }))
    expect(z.size, id).toBe(2)
    const skills = z.get("スキル")!
    const service = [...z.entries()].find((entry) => entry[0] !== "スキル")![1]
    expect(service > skills, `${id} in ${windows.join(", ")}`).toBe(windows.indexOf(id) > windows.indexOf("skills"))
  }
})

it("puts the name-tag menu and the requests over every window and under the dialogue (ui.md §2.1)", () => {
  const every: GameState["windows"] = [...TOGGLED, ...SERVICE_WINDOWS]
  const front = Math.max(...stacking(render([SHOWN.trade.view], { ...SHOWN.trade.state, windows: every })).values())
  const ask = { from: "p2", name: "アグネス" }
  const dialogue = { resident: 0, name: "アルノルト", job: "鍛冶屋", pages: [""], page: 0, choices: [{ label: "さようなら", action: "close" as const }], shownAt: 0 }
  const state = { windows: every, playerMenu: { id: "p2", name: "アグネス" }, tradeAsk: ask, partyAsk: ask, threadAsk: ask, dialogue }
  const talk = zClass(render([DialogueBox], state))
  for (const prompt of [PlayerMenu, TradeAsk, PartyAsk, ThreadAsk]) {
    const z = zClass(render([prompt], state))
    expect(z, prompt.name).toBeGreaterThan(front)
    expect(z, prompt.name).toBeLessThan(talk)
  }
})
