import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { Notices } from "#/components/hud/notices"
import { Game } from "#/world/game"

const render = (game: Game) => renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(Notices) }))

it("hands each new notice to screen readers without moving the focus (ui.md §3.15)", () => {
  const game = new Game()
  // the region is there before the first line, or the first line is not read out
  expect(render(game)).toMatch(/^<div role="status" aria-live="polite" aria-atomic="false"/)
  game.state.set((s) => ({ ...s, notices: [{ id: 1, text: "所持金が足りない。", tone: "bad" }] }))
  expect(render(game)).toMatch(/^<div role="status"[^>]*><div[^>]*>所持金が足りない。<\/div><\/div>$/)
})
