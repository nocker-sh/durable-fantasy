import { entryOpeningHeight } from "#/scripts/lib/entry-opening-height"
import type { SettingDocument } from "#/scripts/lib/setting-document"
export function getEntryOpeningErrors(building: SettingDocument): string[] {
  try {
    entryOpeningHeight(building)
    return []
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)]
  }
}
