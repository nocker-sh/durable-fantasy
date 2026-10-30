// Which ground plan each map is laid out on (layout.ts): read by the scene and by the
// workers that paint the ground, so both see the same map. Data only: nothing here draws.
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import type { Layout } from "#/world/maps/layout-types"
import { CRAFT, FIELD_LAYOUTS, GATE, INDOOR, MARKET } from "#/world/maps/ground-layouts"
import { HOUSES } from "#/world/town/houses"
import { getHouseDoorTrail } from "#/world/maps/get-house-door-trail"

const STREETS: ReadonlyMap<string, Layout> = new Map([
  ["phanthiet", SQUARE_LAYOUT],
  ["phanthiet-market", MARKET],
  ["phanthiet-craft", CRAFT],
  ["phanthiet-gate", GATE],
])
const FIELDS: ReadonlyMap<string, Layout> = new Map(Object.entries(FIELD_LAYOUTS))

/** The town's plans with the trodden ways to every lived-in door added (they are drawn only). */
const trodden = new Map<string, Layout>()

export function layoutOf(map: string): Layout {
  const street = STREETS.get(map)
  if (street) {
    const cached = trodden.get(map)
    if (cached) return cached

    const doors = HOUSES.filter((house) => house.map === map && house.kind !== "vacant").map((house) => getHouseDoorTrail(street.roads, house))
    const layout = { ...street, trails: [...(street.trails ?? []), ...doors] }
    trodden.set(map, layout)
    return layout
  }
  return FIELDS.get(map) ?? (map.includes("-in-") ? INDOOR : SQUARE_LAYOUT)
}
