import { potableWaterCollectionSchema } from "#/scripts/lib/potable-water-supply-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Declaring a drinking-water purpose does not establish safe water or a finished collection site. */
export function getPotableWaterCollectionError(document: SettingDocument): Error | null {
  if (document.water_collection === undefined) return null
  if (document.kind !== "facilities" || document.sanitation_role !== undefined || !potableWaterCollectionSchema.safeParse(document.water_collection).success)
    return new Error("Invalid planned drinking-water collection site")
  if (document.design_gate === "通過") return new Error("Water quality and collection site remain unverified")

  return null
}
