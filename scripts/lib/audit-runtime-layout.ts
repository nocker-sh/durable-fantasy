import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { RuntimeOmission } from "#/scripts/lib/runtime-graphics"
import { inventory } from "#/scripts/lib/runtime-graphics/inventory"

/** A room can be merged or omitted even when all of the generated furniture is supported. */
export function auditRuntimeLayout(document: SettingDocument, actual: { source: string; rooms: readonly RuntimeOmission[] }): string[] {
  const errors: string[] = [],
    recorded = document.runtime_layout_omissions as { source: string; rooms: readonly RuntimeOmission[] } | undefined
  if (recorded && recorded.source !== actual.source) errors.push("Runtime layout source does not match the floor plan")
  if (inventory(recorded?.rooms ?? []) !== inventory(actual.rooms)) errors.push("Runtime layout omissions disagree with the floor plan")
  if (document.status === "描画照合済み" && actual.rooms.length) errors.push("Rendered setting still has unrepresented runtime rooms")
  return errors
}
