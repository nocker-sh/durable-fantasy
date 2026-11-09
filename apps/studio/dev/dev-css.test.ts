import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import { compileTailwindSheet } from "#/scripts/lib/compile-tailwind-sheet.test-support"
import { readCssDeclarations } from "#/scripts/lib/read-css-declarations.test-support"

const STUDIO_ROOT = fileURLToPath(new URL("..", import.meta.url))
const KIT = fileURLToPath(new URL("../../main/components/ui", import.meta.url))
const DEV_CSS = fileURLToPath(new URL("./dev.css", import.meta.url))

it("has every rule the kit's parts need on the studio's server, which scans only apps/studio", async () => {
  const studio = readCssDeclarations(await compileTailwindSheet({ file: DEV_CSS, root: STUDIO_ROOT }))
  const kit = readCssDeclarations(await compileTailwindSheet({ file: DEV_CSS, root: KIT }))
  expect([...kit].filter((entry) => studio.get(entry[0]) !== entry[1]).map((entry) => entry[0])).toEqual([])
})
