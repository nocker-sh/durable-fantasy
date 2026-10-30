import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { RuntimeGraphicsReport } from "#/scripts/lib/runtime-graphics"
import { inventory } from "#/scripts/lib/runtime-graphics/inventory"

/** Compare authored notes with the live renderer's omissions; a note is not rendering evidence. */
export function auditRuntimeGraphics(document: SettingDocument, actual: RuntimeGraphicsReport): string[] {
  const errors: string[] = [],
    recorded = document.runtime_graphics_omissions as RuntimeGraphicsReport | undefined
  if (recorded && recorded.source !== actual.source) errors.push("Runtime graphics source does not match the renderer")
  if (inventory(recorded?.pieces ?? []) !== inventory(actual.pieces)) errors.push("Runtime graphics omissions disagree with the renderer")
  if (document.status === "描画照合済み" && actual.pieces.length) errors.push("Rendered setting still has unsupported runtime furniture")
  return errors
}
