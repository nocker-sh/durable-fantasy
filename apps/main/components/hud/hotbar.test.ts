import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it, vi } from "vitest"
import { GameProvider } from "#/components/game/game-provider"
import { Hotbar } from "#/components/hud/hotbar"
import { artBlocked } from "#/world/core/art-blocked"
import { REASON_TEXT } from "#/world/core/commands"
import { ITEMS } from "#/world/core/items/catalog"
import type { PlayerState } from "#/world/core/player-types"
import { skillKey } from "#/world/core/skill-key"
import { SKILLS } from "#/world/core/skills"
import { Game } from "#/world/game"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

// Image encoding is a browser boundary; the game, hooks and the bar stay real.
vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))

/** The opening tag of the button read out under this name. */
const button = (html: string, label: string) => new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`).exec(html)?.[0]

it("reads out what each shortcut holds, and why an art cannot be used (ui.md §3.13)", () => {
  const base = player({ profileComplete: true, bag: bagWith(["rye-bread", 3]) })
  const traveller: PlayerState = { ...base, hotbar: ["rye-bread", skillKey("chop"), "herb", ...base.hotbar.slice(3).map(() => null)] }
  const blocked = artBlocked("chop", traveller)
  expect(blocked).not.toBeNull()
  const game = new Game()
  game.state.set((s) => ({ ...s, player: traveller }))
  const html = renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(Hotbar) }))
  expect(button(html, `ショートカット 1: ${ITEMS["rye-bread"].name} ×3`)).toBeDefined()
  expect(button(html, `ショートカット 3: ${ITEMS.herb.name} ×0`)).toBeDefined()
  expect(button(html, `ショートカット 2: ${SKILLS.chop.name}`)).toContain(`aria-description="${REASON_TEXT[blocked!]}"`)
  expect(button(html, "ショートカット 4")).toBeDefined()
})
