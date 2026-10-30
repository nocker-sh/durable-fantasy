import { waterVesselSupportSchema } from "#/scripts/lib/water-vessel-support-schema"
import { getWaterVesselSupportParts } from "#/world/town/get-water-vessel-support-parts"
import { getWaterVesselDefinition } from "#/scripts/lib/get-water-vessel-definition"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Furniture = NonNullable<SettingDocument["furniture"]>[number]

/** Resolve a west-wall support and the actual resting position inside its single source furniture slot. */
export function getWaterVesselSupport(room: SettingDocument, furniture: Furniture) {
  const parsed = waterVesselSupportSchema.safeParse(furniture.potable_vessel_support),
    definition = getWaterVesselDefinition(furniture),
    grid = room.grid
  if (!parsed.success || !grid || definition instanceof Error) return new Error("Missing placed water vessel support")
  const support = parsed.data,
    k = grid.cell_m,
    rect = furniture.rect
  if (support.origin_m[0] !== 0 || rect[0] !== 1 || Array.from({ length: rect[3] }, (_, row) => grid.rows[rect[1] + row]?.[0]).some((symbol) => symbol !== "#"))
    return new Error("Water shelf is not attached to its declared west wall")
  if (support.origin_m[0] + support.size_m[0] > rect[2] * k || support.origin_m[1] + support.size_m[1] > rect[3] * k) return new Error("Water shelf leaves its furniture footprint")
  const origin: [number, number] = [rect[0] * k + support.origin_m[0], rect[1] * k + support.origin_m[1]]
  const parts = getWaterVesselSupportParts({
    origin,
    width: support.size_m[0],
    depth: support.size_m[1],
    height: support.height_m,
    thickness: support.thickness_m,
    backThickness: support.back_thickness_m,
    backHeight: support.back_height_m,
    armWidth: support.arm_width_m,
    armThickness: support.arm_thickness_m,
    armInset: support.arm_inset_m,
    frontSetback: support.front_setback_m,
  })
  if (parts instanceof Error) return parts
  const profile = definition.profile,
    vessel = support.vessel_at_m
  if (vessel[0] - profile.radius < 0 || vessel[0] + profile.radius > support.size_m[0] || vessel[1] - profile.halfWidth < 0 || vessel[1] + profile.halfWidth > support.size_m[1])
    return new Error("Water vessel base or handles leave the shelf top")

  return { support, definition, parts, position: [origin[0] + vessel[0], support.height_m, origin[1] + vessel[1]] satisfies [number, number, number] }
}
