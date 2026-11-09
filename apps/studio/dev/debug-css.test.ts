import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import { compileTailwindSheet } from "#/scripts/lib/compile-tailwind-sheet.test-support"
import { readCssDeclarations } from "#/scripts/lib/read-css-declarations.test-support"

// the game's server builds this sheet when the dev game page loads the panel, after game.css
const GAME_ROOT = fileURLToPath(new URL("../../main", import.meta.url))
const GAME_CSS = fileURLToPath(new URL("../../main/components/game/game.css", import.meta.url))
const DEBUG_CSS = fileURLToPath(new URL("./debug.css", import.meta.url))

it("changes no rule or :root value that game.css makes", async () => {
  const game = readCssDeclarations(await compileTailwindSheet({ file: GAME_CSS, root: GAME_ROOT }))
  const debug = readCssDeclarations(await compileTailwindSheet({ file: DEBUG_CSS, root: GAME_ROOT }))
  expect([...debug].filter((entry) => game.has(entry[0]) && game.get(entry[0]) !== entry[1])).toEqual([])
})

it("builds the panel's own place and size, though the panel lies outside the game's folder", async () => {
  const css = await compileTailwindSheet({ file: DEBUG_CSS, root: GAME_ROOT })
  for (const selector of [".top-3 {", ".w-80 {", ".z-\\[100\\] {"]) expect(css).toContain(selector)
})
