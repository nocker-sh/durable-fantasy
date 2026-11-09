import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it, vi } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { Chat } from "#/components/hud/chat"
import { Game } from "#/world/game"

// A window reads its saved place and fold after it mounts in the browser. Here the chat starts folded,
// as the player left it; every other state is React's own.
vi.mock("react", async (original) => {
  const actual = await original<typeof import("react")>()
  return { ...actual, useState: (initial: unknown) => actual.useState(initial === null ? { x: 0, y: 0, folded: true } : initial) }
})

function render(typing: boolean) {
  const game = new Game()
  game.state.set((s) => ({ ...s, windows: ["chat"], typing }))
  return renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(Chat) }))
}

it("keeps a folded chat to its title bar while nobody is typing", () => {
  const html = render(false)
  expect(html).toContain('aria-label="広げる"')
  expect(html).not.toContain("メッセージを入力…")
})

it("opens a folded chat out when Enter starts typing, so its field is there to take the caret (ui.md §3.4)", () => {
  const html = render(true)
  expect(html).toContain('aria-label="たたむ"')
  expect(html).toMatch(/<input[^>]*placeholder="メッセージを入力…"/)
})
