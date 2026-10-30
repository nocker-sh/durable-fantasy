import { waterVesselDesignSchema } from "#/scripts/lib/water-vessel-design-schema"
import { getWaterVesselProfile } from "#/world/town/get-water-vessel-profile"
import { getWaterVesselParts } from "#/world/town/get-water-vessel-parts"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Furniture = NonNullable<SettingDocument["furniture"]>[number]

/** Resolve construction from the same placed vessel, never from a second copy of its body dimensions. */
export function getWaterVesselDefinition(furniture: Furniture) {
  const parsed = waterVesselDesignSchema.safeParse(furniture.potable_vessel),
    vessel = furniture.transport_container
  if (!parsed.success || !vessel || vessel.stream !== "potable_water") return new Error("Missing water vessel construction")
  const design = parsed.data
  const profile = getWaterVesselProfile({
    diameter: vessel.outer_diameter_m,
    height: vessel.outer_height_m,
    innerDiameter: vessel.inner_diameter_m,
    usableDepth: vessel.usable_depth_m,
    base: design.base_thickness_m,
    lid: design.lid_thickness_m,
    knobHeight: design.knob_height_m,
    knobRadius: design.knob_radius_m,
    handles: { gap: design.handles.gap_m, openingHeight: design.handles.opening_height_m, radius: design.handles.bar_radius_m, centreHeight: design.handles.centre_height_m },
  })
  if (profile instanceof Error) return profile
  if (vessel.capacity_l > profile.capacityLitres) return new Error("Water vessel capacity exceeds its constructed cavity")

  return { profile, parts: getWaterVesselParts(profile) }
}
