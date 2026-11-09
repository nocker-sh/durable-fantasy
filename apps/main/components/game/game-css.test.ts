import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import { compileTailwindSheet } from "#/scripts/lib/compile-tailwind-sheet.test-support"
import { readCssDeclarations } from "#/scripts/lib/read-css-declarations.test-support"

const STUDIO_ROOT = fileURLToPath(new URL("../../../studio", import.meta.url))
const COMPONENTS = fileURLToPath(new URL("..", import.meta.url))
const GAME_CSS = fileURLToPath(new URL("./game.css", import.meta.url))

it("has every rule the HUD and game parts need when the studio builds it for /ui/frame", async () => {
  const studio = readCssDeclarations(await compileTailwindSheet({ file: GAME_CSS, root: STUDIO_ROOT }))
  const components = readCssDeclarations(await compileTailwindSheet({ file: GAME_CSS, root: COMPONENTS }))
  expect([...components].filter((entry) => studio.get(entry[0]) !== entry[1]).map((entry) => entry[0])).toEqual([])
})
