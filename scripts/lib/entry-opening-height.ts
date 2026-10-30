import type { SettingDocument } from "#/scripts/lib/setting-document"
import { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"
import { MIN_STANDING_HEADROOM_M } from "#/scripts/lib/spatial-rules"
/** A walking entrance must provide headroom and fit below its ground-floor ceiling. */
export function entryOpeningHeight(building: SettingDocument): number {
  const height = building.entry_opening_height_m
  const levels = floorLevelsSchema.safeParse(building.floor_levels ?? [])
  const level = levels.success ? levels.data.find((level) => level.floor === 0) : null
  if (typeof height !== "number" || !Number.isFinite(height) || height < MIN_STANDING_HEADROOM_M) throw new Error("Entrance height does not provide standing headroom")
  if (
    !level ||
    !Number.isFinite(level.elevation_m) ||
    typeof level.ceiling_elevation_m !== "number" ||
    !Number.isFinite(level.ceiling_elevation_m) ||
    height > level.ceiling_elevation_m - level.elevation_m
  )
    throw new Error("Entrance height does not fit its storey")
  return height
}
