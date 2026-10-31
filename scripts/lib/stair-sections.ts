import { stairSectionsSchema } from "#/scripts/lib/stair-sections-schema"
import { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { stairHeadroom } from "#/scripts/lib/stair-headroom"
import { MAX_STAIR_RISER_M, MIN_STAIR_GOING_M, MIN_STAIR_HEADROOM_M, MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
type Connection = { kind?: string; target: string; furniture?: string; target_furniture?: string; access?: number[]; target_access?: number[] }
/** A matching rectangle on two floors is insufficient to design the stair between them. */
export function auditStairSections(building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  const parsedSections = stairSectionsSchema.safeParse(building.stair_sections ?? [])
  if (!parsedSections.success) return ["Invalid stair sections"]

  const parsedLevels = floorLevelsSchema.safeParse(building.floor_levels ?? [])
  if (!parsedLevels.success) return ["Invalid stair floor levels"]

  const sections = parsedSections.data,
    levels = parsedLevels.data
  const errors: string[] = [],
    seen = new Set<string>()
  if (levels && new Set(levels.map((level) => level.floor)).size !== levels.length) errors.push("Duplicate floor elevation")
  for (const section of sections) {
    const key = `${section.lower_room}:${section.upper_room}:${section.furniture}`
    if (seen.has(key)) errors.push("Duplicate stair section")
    seen.add(key)
    const lower = documents.get(section.lower_room),
      upper = documents.get(section.upper_room)
    const connection = (lower?.connections as Connection[] | undefined)?.find((c) => c.kind === "stair" && c.target === section.upper_room && c.furniture === section.furniture)
    const stair = lower?.furniture?.find((f) => f.symbol === section.furniture)
    const upperStair = upper?.furniture?.find((f) => f.symbol === connection?.target_furniture)
    if (!lower?.grid || !upper?.grid || lower.building !== building.id || upper.building !== building.id || Number(upper.floor) !== Number(lower.floor) + 1 || !connection || !stair || !upperStair) {
      errors.push("Stair section has no matching floor connection")
      continue
    }
    const bottom = levels?.find((level) => level.floor === lower.floor)?.elevation_m,
      top = levels?.find((level) => level.floor === upper.floor)?.elevation_m
    if (bottom === undefined || top === undefined || top <= bottom) {
      errors.push("Stair section has no increasing floor elevations")
      continue
    }
    const rise = (top - bottom) / section.risers,
      along = section.axis === "x" ? 0 : 1
    const length = stair.rect[2 + along] * lower.grid.cell_m,
      width = stair.rect[3 - along] * lower.grid.cell_m
    if (rise > MAX_STAIR_RISER_M) errors.push("Stair riser is too high")
    if (section.going_m < MIN_STAIR_GOING_M) errors.push("Stair going is too short")
    if (section.clear_width_m < MIN_PASSAGE_WIDTH_M || section.clear_width_m > width - 2 * (section.rail_inset_m ?? 0) + 1e-9) errors.push("Stair clear width does not fit its footprint")
    if (section.rail_inset_m === undefined && building.design_gate === "通過") errors.push("Stair rails have no designed allowance")
    if (section.landing_depth_m < section.clear_width_m) errors.push("Stair landing is shallower than its clear width")
    if ((section.risers - 1) * section.going_m + 2 * section.landing_depth_m > length + 1e-9) errors.push("Stair run and landings do not fit its footprint")
    const clearance = stairHeadroom({
      bottom_m: bottom,
      top_m: top,
      risers: section.risers,
      going_m: section.going_m,
      opening_length_m: section.opening_length_m,
      lower_ceiling_m: levels?.find((l) => l.floor === lower.floor)?.ceiling_elevation_m ?? null,
      upper_ceiling_m: levels?.find((l) => l.floor === upper.floor)?.ceiling_elevation_m ?? null,
    })
    errors.push(...clearance.problems)
    if (clearance.minimum_m === null ? building.design_gate === "通過" : clearance.minimum_m + 1e-9 < MIN_STAIR_HEADROOM_M) errors.push("Stair headroom is not established")
    for (const entry of [
      [connection.access, section.lower_end, stair.rect, lower.grid.cell_m],
      [connection.target_access, section.lower_end === "start" ? "end" : "start", upperStair.rect, upper.grid.cell_m],
    ] as const) {
      const point = entry[0]
      const end = entry[1]
      const rect = entry[2]
      const scale = entry[3]

      if (!point) {
        errors.push("Stair landing has no access position")
        continue
      }
      const endLength = rect[2 + along] * scale,
        position = Math.max(0, Math.min(endLength, (point[along] - rect[along] + 0.5) * scale))
      if (end === "start" ? position > section.landing_depth_m : position < endLength - section.landing_depth_m) errors.push("Stair access does not meet its end landing")
    }
  }
  if (building.design_gate === "通過")
    for (const id of (building.rooms ?? []) as string[]) {
      const room = documents.get(id)
      for (const c of (room?.connections ?? []) as Connection[])
        if (c.kind === "stair" && Number(documents.get(c.target)?.floor) > Number(room?.floor) && !seen.has(`${id}:${c.target}:${c.furniture}`)) errors.push("Stair has no designed section")
    }
  return [...new Set(errors)]
}
