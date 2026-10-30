import { MIN_OPERATING_SIDE_M } from "#/scripts/lib/spatial-rules"
import type { WaterLanding } from "#/scripts/lib/water-landing-schema"

/** The authored receiving floor is distinct from the well's full site and its public through routes. */
export function getWaterLandingGridError(landing: WaterLanding): Error | null {
  const width = landing.rows[0].length,
    depth = landing.rows.length
  if (landing.rows.some((row) => row.length !== width) || new Set(landing.zones.map((zone) => zone.symbol)).size !== 3 || new Set(landing.zones.map((zone) => zone.role)).size !== 3)
    return new Error("Invalid water landing zones or rows")
  if (landing.zones.some((zone) => zone.rect[0] + zone.rect[2] > width || zone.rect[1] + zone.rect[3] > depth || Math.min(zone.rect[2], zone.rect[3]) * landing.cell_m < MIN_OPERATING_SIDE_M))
    return new Error("Water landing zone leaves its grid or is too narrow")
  for (const z of landing.rows.keys())
    for (const x of [...landing.rows[z]].keys()) {
      const zones = landing.zones.filter((zone) => x >= zone.rect[0] && x < zone.rect[0] + zone.rect[2] && z >= zone.rect[1] && z < zone.rect[1] + zone.rect[3])
      if (zones.length > 1 || landing.rows[z][x] !== (zones[0]?.symbol ?? ".")) return new Error("Water landing grid disagrees with its occupied zones")
    }

  return null
}
