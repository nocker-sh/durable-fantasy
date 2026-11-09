import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { SystemModals } from "#/components/hud/system-menu"
import { Game } from "#/world/game"
import { CHANNELS } from "#/world/channels"
import type { GameState } from "#/world/state"
import { player } from "#/world/test/player"

vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

const talking: Partial<GameState> = { dialogue: { resident: 0, name: "アルノルト", job: "鍛冶屋", pages: [""], page: 0, choices: [], shownAt: 0 } }

function channels(patch: Partial<GameState> = {}) {
  vi.useFakeTimers()
  const game = new Game()
  game.state.set((state) => ({ ...state, player: player({ profileComplete: true }), modal: "channel", room: { world: 1, channel: 1, channels: { 1: 3, 2: 5 } }, ...patch }))
  const html = renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(SystemModals) }))
  return { game, html }
}

it("offers the other channels and a new one, and a way back to the menu", () => {
  const view = channels()
  expect(view.html).toContain("ch.3")
  expect(view.html).toContain("新しく開く")
  expect(view.html).not.toContain("aria-description")
  expect(view.html).toMatch(/<button[^>]*>戻る<\/button>/)
})

it.each<[string, Partial<GameState>, string]>([
  ["talking", talking, "会話や店の最中は移れない。"],
  [
    "trading",
    { trade: { with: "other", name: "Hans", lots: [], mine: { stacks: [], gold: 0, locked: false, done: false }, theirs: { stacks: [], gold: 0, locked: false, done: false } } },
    "取引の最中は移れない。",
  ],
])("greys out moving while %s and says why", (_while, patch, reason) => {
  const view = channels(patch)
  const moves = [...view.html.matchAll(/<button([^>]*)>移る<\/button>/g)]
  expect(moves).toHaveLength(2)
  for (const move of moves) {
    expect(move[1]).toMatch(/\sdisabled=""/)
    expect(move[1]).toContain(`aria-description="${reason}"`)
  }
  // the menu's own refusal, for a press that gets through anyway
  view.game.changeChannel(2)
  expect(view.game.state.get().notices.map((notice) => notice.text)).toEqual([reason])
  expect(view.game.state.get().dialogue).toEqual(patch === talking ? talking.dialogue : null)
})

it("offers no channel past the last one", () => {
  const view = channels({ room: { world: 1, channel: 1, channels: { 1: 3, [CHANNELS]: 2 } } })
  expect(view.html).toContain(`ch.${CHANNELS}`)
  expect(view.html).not.toContain(`ch.${CHANNELS + 1}`)
  expect(view.html).not.toContain("新しく開く")
  view.game.changeChannel(CHANNELS + 1)
  expect(view.game.state.get().notices).toEqual([])
  expect(view.game.state.get().room?.channel).toBe(1)
})
