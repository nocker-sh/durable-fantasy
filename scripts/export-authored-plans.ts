import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
import { getAuthoredExportTargets } from "#/scripts/lib/get-authored-export-targets"
import { prepareAuthoredPlanExport } from "#/scripts/lib/prepare-authored-plan-export"
import { writeAuthoredPlanExport } from "#/scripts/lib/write-authored-plan-export"

const root = fileURLToPath(new URL("../", import.meta.url)),
  base = resolve(root, ".docs/settings"),
  directory = resolve(root, "world/town/floorplan/authored")
const entries = readSettingIndex(JSON.parse(await readFile(resolve(base, "index.json"), "utf8")))
const targets = getAuthoredExportTargets(process.argv.slice(2), entries)
const prepared = await Promise.all(targets.map((buildingId) => prepareAuthoredPlanExport({ base, directory, entries, buildingId })))
for (const source of prepared) {
  const written = await writeAuthoredPlanExport(source)
  console.log(`${written.changed ? "Exported" : "Unchanged"} ${written.id}: ${written.roomCount} rooms`)
}
