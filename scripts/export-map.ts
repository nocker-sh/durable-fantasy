// Publish scene walk grids, or compare them without writing: bun scripts/export-map.ts [URL] [map …] [--check]
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright-core"
import { getMapSnapshotModule } from "#/scripts/lib/get-map-snapshot-module"
import { readSceneMapSnapshot } from "#/scripts/lib/read-scene-map-snapshot"
import { serializeMapSnapshot } from "#/scripts/lib/serialize-map-snapshot"
import { MAP_EXPORT_IDS } from "#/scripts/lib/map-export-ids"

const check = process.argv.includes("--check")
const args = process.argv.slice(2).filter((arg) => arg !== "--check")
const base = args[0] ?? "https://durable-fantasy.localhost/"
const maps = args.length > 1 ? args.slice(1) : MAP_EXPORT_IDS
const module = getMapSnapshotModule(join(import.meta.dirname, "..", "dev"))
const browser = await chromium.launch()
try {
  for (const map of maps) {
    const snapshot = await readSceneMapSnapshot({ browser, base, map, module })
    const content = serializeMapSnapshot({ map, snapshot })
    const file = join(import.meta.dirname, "..", "world", "maps", `${map}.json`)
    const matches = !check || readFileSync(file, "utf8") === content
    if (!check) writeFileSync(file, content)
    else if (!matches) process.exitCode = 1
    console.log(`${map}: ${check ? (matches ? "matched" : "DIFFERS") : "written"}`)
  }
} finally {
  await browser.close()
}
