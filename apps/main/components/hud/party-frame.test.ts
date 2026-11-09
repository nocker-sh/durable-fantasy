import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { PartyFrame } from "#/components/hud/party-frame"
import { PARTY_MAX } from "#/world/core/party/rules"
import { Game } from "#/world/game"

it("keeps a full party reachable in its fixed frame, clear of where the system log first opens (ui.md §3.12)", () => {
  const members = Array.from({ length: PARTY_MAX }, (_, i) => ({ key: `p${i}`, name: `仲間${i}`, level: 5, hp: 30, maxHp: 40, map: "広場", leader: i === 0, me: i === 0, away: false }))
  const game = new Game()
  game.state.set((s) => ({ ...s, party: { mode: "own", leading: true, members } }))
  const html = renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(PartyFrame) }))
  const frame = /<div data-slot="panel" class="([^"]*)"/.exec(html)![1]
  const list = /<ul class="([^"]*)"/.exec(html)![1].split(" ")
  // every member is drawn and the list scrolls inside the frame instead of running off the screen
  expect(html.match(/<li\b/g)).toHaveLength(PARTY_MAX)
  expect(list).toEqual(expect.arrayContaining(["min-h-0", "overflow-y-auto"]))
  const top = Number(/(?:^|\s)top-\[(\d+)px\]/.exec(frame)![1])
  const cap = /(?:^|\s)max-h-\[max\((\d+)px,calc\(50%-(\d+)px\)\)\]/.exec(frame)!
  for (const height of [600, 657, 768, 900, 1080]) {
    // the system log first opens at half the height less 40 (system-log.tsx)
    expect(top + Math.max(Number(cap[1]), height / 2 - Number(cap[2])), `${height}px`).toBeLessThanOrEqual(Math.round(height / 2 - 40))
  }
})
