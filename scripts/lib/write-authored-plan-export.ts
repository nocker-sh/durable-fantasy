import { readFile, mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import type { AuthoredPlanExport } from "#/scripts/lib/authored-plan-export-types"

/** Preserve timestamps for unchanged sources; unrelated I/O errors must not be treated as missing output. */
export async function writeAuthoredPlanExport(prepared: AuthoredPlanExport) {
  const previous = await readFile(prepared.filePath, "utf8").catch((error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return null
    throw error
  })
  const changed = prepared.source !== previous
  if (changed) {
    await mkdir(dirname(prepared.filePath), { recursive: true })
    await writeFile(prepared.filePath, prepared.source)
  }
  return { id: prepared.id, roomCount: prepared.roomCount, changed }
}
