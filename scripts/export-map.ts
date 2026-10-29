// Write each map's walk grid and its named places to world/maps/<map>.json, for the server to
// check paths and distances without building the 3D scene. Both come from the scene the browser
// builds, read off the /dev map view (pages/dev/view.tsx), so run this after changing the terrain,
// buildings or what stands about, with the dev server running:
//   bun scripts/export-map.ts [dev server URL] [map …]
// In a container without a GPU, set CHROME to the browser and it is started with software WebGL.
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright-core"

const URL = (process.argv[2] ?? "https://durable-fantasy.localhost/").replace(/\/$/, "")
const only = process.argv.slice(3)
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } : {})
for (const map of only.length
  ? only
  : [
      "phanthiet",
      "phanthiet-market",
      "phanthiet-craft",
      "phanthiet-gate",
      "south-meadow",
      "red-dunes",
      "sea-cliff",
      "net-sheds",
      "forest-edge",
      "deep-forest",
      "quynhon-gate",
      "mountain-pass",
      "hue-gate",
    ]) {
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage()
  await page.goto(`${URL}/dev/view?map=${map}&ui=0&blur=0`)
  await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 180_000 })
  const data = await page.evaluate(() => {
    // the very grid the scene built
    const view = (window as unknown as { view: { walkGrid(): Uint8Array; places(): Record<string, [number, number]> } }).view
    const grid = view.walkGrid()
    let bits = ""
    for (let i = 0; i < grid.length; i++) bits += grid[i] ? "1" : "0"
    return { size: Math.round(Math.sqrt(grid.length)), blocked: bits, places: view.places() }
  })
  await page.close()

  // one row of the grid per line, '#' blocked and '.' free, readable in a diff
  const rows: string[] = []
  for (let j = 0; j < data.size; j++)
    rows.push(
      data.blocked
        .slice(j * data.size, (j + 1) * data.size)
        .replace(/1/g, "#")
        .replace(/0/g, "."),
    )
  const out = { size: data.size, rows, places: data.places }
  writeFileSync(join(import.meta.dirname, "..", "world", "maps", `${map}.json`), JSON.stringify(out, null, 1) + "\n")
  console.log(`${map}: grid ${data.size}×${data.size}, ${Object.keys(data.places).length} places`)
}
await browser.close()
