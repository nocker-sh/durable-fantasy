import type { HearthSpec } from "#/world/town/hearth-types"
export function hearthDimensions(value: unknown): HearthSpec {
  const raw = value as Record<string, unknown> | undefined
  const spec = {
    height: raw?.height_m,
    openingBottom: raw?.opening_bottom_m,
    openingTop: raw?.opening_top_m,
    openingWidth: raw?.opening_width_m,
    openingOffset: raw?.opening_offset_m,
    chamberDepth: raw?.chamber_depth_m,
  }
  if (!Object.values(spec).every((v) => typeof v === "number" && Number.isFinite(v))) throw new Error("Hearth chamber dimensions are missing")
  return spec as HearthSpec
}
