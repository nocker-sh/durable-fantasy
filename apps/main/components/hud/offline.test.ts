import { createElement, type ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it, vi } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { Hud } from "#/components/hud/hud"
import { Offline } from "#/components/hud/offline"
import { Game } from "#/world/game"
import type { GameState } from "#/world/state"

vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))

function render(component: ComponentType, patch: Partial<GameState>) {
  const game = new Game()
  game.state.set((state) => ({ ...state, ...patch }))
  return renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(component) }))
}

it("asks for a reload, not a reconnection, once the room runs a newer build", () => {
  const html = render(Offline, { online: "offline", outdated: true, loading: null })
  expect(html).toContain("新しい版になった")
  expect(html).toMatch(/<button[^>]*>読み込み直す<\/button>/)
  expect(html).not.toContain("つなぎ直しています")
})

it("says so even before the first map was entered, when the loading screen would never end", () => {
  const html = render(Hud, { online: "offline", outdated: true, player: null })
  expect(html).toContain("新しい版になった")
})

it("still reconnects on its own after an ordinary disconnection", () => {
  const html = render(Offline, { online: "offline", loading: null })
  expect(html).toContain("つなぎ直しています")
  expect(html).not.toContain("新しい版になった")
  expect(html).not.toContain("<button")
})
