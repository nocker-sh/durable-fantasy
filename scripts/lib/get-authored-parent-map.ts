import { z } from "zod"
import type { SettingDocument } from "#/scripts/lib/setting-document"

const mapSchema = z.object({ id: z.string(), kind: z.literal("maps"), map_id: z.string().min(1) })

/** Resolve the runtime ID through the referenced map document; never infer it from a filename prefix. */
export function getAuthoredParentMap(building: SettingDocument, document: SettingDocument): string {
  const map = mapSchema.safeParse(document)
  if (!map.success || building.map !== map.data.id) throw new Error("Building exterior map reference is inconsistent")
  return map.data.map_id
}
