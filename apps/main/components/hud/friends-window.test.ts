import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it, vi } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { FriendsWindow } from "#/components/hud/friends-window"
import { Game } from "#/world/game"
import type { GameState } from "#/world/state"
import { player } from "#/world/test/player"

vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))

/** the attribute, not the disabled: styles every button carries in its class */
const DISABLED = /\sdisabled=""/

/** Visiting town 3, holding threads to towns 3 and 5. */
function buttons(patch: Partial<GameState> = {}) {
  const game = new Game()
  const threads = [
    { key: "a", name: "Hans", town: 3, at: 0 },
    { key: "b", name: "Grete", town: 5, at: 1 },
  ]
  game.state.set((state) => ({ ...state, player: player({ profileComplete: true, threads }), windows: ["friends"], homeTown: 1, room: { world: 3, channel: 1, channels: {} }, ...patch }))
  const html = renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(FriendsWindow) }))
  return [...html.matchAll(/<button([^>]*)>(自分の町へ帰る|糸をたどる)<\/button>/g)].map((match) => ({ label: match[2], attributes: match[1] }))
}

it("lets a thread be followed, and home be gone back to, from a town", () => {
  const shown = buttons()
  expect(shown.map((button) => button.label)).toEqual(["自分の町へ帰る", "糸をたどる"])
  for (const button of shown) expect(button.attributes).not.toMatch(DISABLED)
})

it.each<[string, Partial<GameState>, string]>([
  ["while talking", { shop: "bakery" }, "会話や店の最中は移れない。"],
  ["out of town", { map: { id: "south-meadow", name: "南の草原", warps: [] } }, "町の外では糸をたどれない。"],
])("greys out following a thread %s and says why", (_when, patch, reason) => {
  const shown = buttons(patch)
  expect(shown).toHaveLength(2)
  for (const button of shown) {
    expect(button.attributes).toMatch(DISABLED)
    expect(button.attributes).toContain(`aria-description="${reason}"`)
  }
})
