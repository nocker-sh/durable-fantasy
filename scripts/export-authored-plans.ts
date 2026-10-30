import { readFile, mkdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { z } from "zod"
import { getAuthoredPlanSource } from "#/scripts/lib/get-authored-plan-source"
import { readSetting } from "#/scripts/lib/read-setting"
import { compileAuthoredPlan } from "#/scripts/lib/authored-plan"

const root = new URL("../", import.meta.url)
const building = readSetting(await readFile(new URL(".docs/settings/buildings/building-h-m5.md", root), "utf8"))
const roomIds = z.array(z.string()).parse(building.rooms)
const rooms = await Promise.all(roomIds.map(async (id) => readSetting(await readFile(new URL(`.docs/settings/rooms/${id}.md`, root), "utf8"))))
const plan = compileAuthoredPlan(building, rooms)
const directory = new URL("world/town/floorplan/authored/", root)
const destination = new URL(`${plan.id}.ts`, directory)
const source = getAuthoredPlanSource({ plan, filePath: fileURLToPath(destination) })
const previous = await readFile(destination, "utf8").catch((error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return null
  throw error
})
// An unchanged export must not reload an active game during an inspection.
if (source !== previous) {
  await mkdir(directory, { recursive: true })
  await writeFile(destination, source)
}
console.log(`${source === previous ? "Unchanged" : "Exported"} ${plan.id}: ${plan.rooms.length} rooms`)
