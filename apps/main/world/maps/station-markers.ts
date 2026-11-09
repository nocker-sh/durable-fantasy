import { STATIONS } from "#/world/town/stations"
import { INTERIORS } from "#/world/town/interiors"
import { outsideDoor } from "#/world/town/outside-door"
import type { Cell } from "#/world/maps/types"

/** Each shared station where it stands, and an indoor one also at its building's door on the street (ui.md §3.2). */
const locations = STATIONS.flatMap((station) => {
  const points: { map: string; cell: Cell; name: string }[] = [{ map: station.map, cell: [station.cell[0], station.cell[1]], name: station.name }]
  const inside = INTERIORS.find((interior) => interior.id === station.map)
  if (inside) points.push({ map: inside.house.map, cell: outsideDoor(inside.house).door, name: inside.house.name ?? station.name })
  return points
})

/** The shared work stations on a map, one marker per place, named for what stands there. */
export function stationMarkers(map: string): { cell: Cell; names: string[] }[] {
  const groups = new Map<string, { cell: Cell; names: string[] }>()
  for (const location of locations) {
    if (location.map !== map) continue
    const key = location.cell.join(",")
    const group = groups.get(key) ?? { cell: location.cell, names: [] }
    if (!group.names.includes(location.name)) group.names.push(location.name)
    groups.set(key, group)
  }
  return [...groups.values()]
}
