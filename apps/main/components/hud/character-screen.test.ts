import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { createGameState } from "#/world/client/initial-state"
import { newPlayer } from "#/world/core/new-player"
import { CharacterScreen } from "#/components/hud/character-screen"

let state = createGameState().get()
vi.mock("#/hooks/use-game", () => ({ useGame: () => ({}) }))
vi.mock("#/hooks/use-game-state", () => ({
  useGameState: (select: (value: typeof state) => unknown) => select(state),
}))
beforeEach(() => {
  vi.stubGlobal("localStorage", { getItem: () => null })
  state = { ...createGameState().get(), player: newPlayer(), online: "online" }
})
afterEach(() => vi.unstubAllGlobals())

it("gives first creation its own screen and a directly selectable set of appearances", () => {
  const html = renderToStaticMarkup(createElement(CharacterScreen))
  expect(html).toContain('class="character-creation"')
  expect(html).toContain('aria-label="キャラクターを作る"')
  expect(html).toContain("キャラクター作成")
  expect(html).not.toContain("暮らしが始まる")
  expect(html).not.toContain("DURABLE FANTASY")
  expect(html).toContain('aria-label="姿：剣士"')
  expect(html).toContain('aria-label="姿：商人"')
  expect(html).toContain("はじめる")
  expect(html).not.toContain("ui-titlebar")
  expect(html).toContain('aria-label="赤"')
  expect(html).not.toContain('aria-label="cRed"')
  expect(html).toMatch(/aria-pressed="true"[^>]*>マフラー/)
})

it("keeps an existing character's edits in the compact modal", () => {
  state = { ...state, player: { ...state.player!, profileComplete: true } }
  const html = renderToStaticMarkup(createElement(CharacterScreen))
  expect(html).toContain('aria-label="キャラクター"')
  expect(html).toContain("ui-titlebar")
  expect(html).not.toContain('class="character-creation"')
  expect(html).not.toContain("はじめる")
})
