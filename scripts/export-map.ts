// Write each map's walk grid and where each resident stands to world/maps/<map>.json, for the
// server to check paths and distances without building the 3D scene. Both come from the scene
// selected scene builds without joining a saved player. Run after changing terrain, buildings
// or residents, with the
// dev server running:
//   bun scripts/export-map.ts [dev server URL] [map …]
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright-core"

const URL = process.argv[2] ?? "https://durable-fantasy.localhost/"
const only = process.argv.slice(3)
const browser = await chromium.launch()
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
  await page.goto(new globalThis.URL(`/dev/maps/${map}`, URL).href)
  const data = await page.evaluate(async (id) => {
    const mapSnapshotSource = await import("/dev/map-snapshot"),
      mapSnapshot = mapSnapshotSource.mapSnapshot
    return mapSnapshot(id)
  }, map)
  if (data.id !== map) throw new Error(`Refusing grid for a different map: ${data.id}`)
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
