import { readFile, mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import type { AuthoredPlanExport } from "#/scripts/lib/authored-plan-export-types"

/** 改行だけが異なるチェックアウトも同じ出力として時刻を保ち、読取り失敗を欠落と取り違えない。 */
export async function writeAuthoredPlanExport(prepared: AuthoredPlanExport) {
  const previous = await readFile(prepared.filePath, "utf8").catch((error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return null
    throw error
  })
  const changed = prepared.source.replace(/\r\n/g, "\n") !== previous?.replace(/\r\n/g, "\n")
  if (changed) {
    await mkdir(dirname(prepared.filePath), { recursive: true })
    await writeFile(prepared.filePath, prepared.source)
  }
  return { id: prepared.id, roomCount: prepared.roomCount, changed }
}
