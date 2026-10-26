import { SHOPS, type ShopId, type ShopDefinition } from "../core/shops.ts"
import { RESIDENTS } from "../town/residents.ts"
import { workSpot } from "../town/routines.ts"
import { INTERIORS, outsideDoor } from "../town/interiors.ts"
import { cellOfSpot, shopOpen, type Cell } from "./index.ts"

/** Fixed pitches and counters stay on the map when their keepers leave. */
const locations = (Object.entries(SHOPS) as [ShopId, ShopDefinition][]).flatMap(([id, shop]) => {
  const keeper = RESIDENTS.find((r) => shop.keepers.includes(r.name))
  if (!keeper) return []
  const spot = shop.at ?? workSpot(keeper)
  const cell = cellOfSpot(spot)
  if (!cell) return []
  const inside = INTERIORS.find((it) => it.id === spot.map)
  const points: { map: string; cell: Cell }[] = [{ map: spot.map, cell }]
  if (inside) points.push({ map: inside.house.map, cell: outsideDoor(inside.house).door })
  return points.map((point) => ({ ...point, id, name: shop.name }))
})

/** Shared pitches have one marker, with the status of each seller available in its label. */
export function shopMarkers(map: string, min: number) {
  const groups = new Map<string, { cell: Cell; shops: { id: ShopId; name: string; open: boolean }[] }>()
  for (const location of locations) {
    if (location.map !== map) continue
    const key = location.cell.join(",")
    let group = groups.get(key)
    if (!group) groups.set(key, (group = { cell: location.cell, shops: [] }))
    group.shops.push({ id: location.id, name: location.name, open: shopOpen(location.id, min) })
  }
  return [...groups.values()]
}
