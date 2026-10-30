import { workTableSections } from "#/world/town/work-table"
import { workSurface } from "#/scripts/lib/work-surface"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import { hearthParts } from "#/world/town/hearth-parts"
import { flueWalls } from "#/world/town/flue-walls"
import { flueCorbelParts } from "#/world/town/flue-corbel"
import { compileFlues } from "#/scripts/lib/flue-sections"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import { roomEnvelopeObstacles } from "#/scripts/lib/room-envelope-obstacles"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Furniture = NonNullable<SettingDocument["furniture"]>[number]
/** Room-local metres. Unmodelled furniture reserves its whole column; overlap remains unresolved. */
type Props = {
  room: SettingDocument
  building: SettingDocument
  documents: ReadonlyMap<string, SettingDocument>
  hearth: Furniture
}
export function hearthRoomSection(props: Props) {
  const room = props.room
  const building = props.building
  const documents = props.documents
  const hearth = props.hearth

  if (!room.grid || !hearth.hearth_front) throw new Error("Hearth has no room grid or front")
  const k = room.grid.cell_m,
    level = (building.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[] | undefined)?.find((l) => l.floor === room.floor),
    ceiling = level ? level.ceiling_elevation_m - level.elevation_m : NaN
  if (!Number.isFinite(ceiling) || ceiling <= 0) throw new Error("Hearth has no ceiling section")
  const definitions = (building.flues ?? []) as { lower_room: string; hearth: string }[],
    index = definitions.findIndex((d) => d.lower_room === room.id && d.hearth === hearth.symbol),
    global = compileFlues(building, documents)[index]
  if (!global) throw new Error("Hearth has no flue section")
  const oxState = room.origin as number[],
    ox = oxState[0],
    oz = oxState[1],
    shaft = { ...global, x0: global.x0 - ox * k, x1: global.x1 - ox * k, z0: global.z0 - oz * k, z1: global.z1 - oz * k }
  const bounds = { x0: 0, z0: 0, x1: room.grid.rows[0].length * k, z1: room.grid.rows.length * k },
    xState = hearth.rect.map((n) => n * k),
    x = xState[0],
    z = xState[1],
    w = xState[2],
    d = xState[3],
    spec = hearthDimensions(hearth.hearth)
  const masonry: Cuboid[] = [
    ...hearthParts({ bounds: { x0: x, z0: z, x1: x + w, z1: z + d }, front: hearth.hearth_front, spec: spec, shaft: shaft, bottom: 0 }).masonry,
    ...flueWalls(shaft, shaft.wallThickness).walls.map((r) => ({ ...r, bottom: spec.height, top: ceiling })),
    ...flueCorbelParts(shaft, ceiling, bounds),
  ]
  const surrounding: Cuboid[] = roomEnvelopeObstacles(room).map((entry) => {
    const x0 = entry[0]
    const z0 = entry[1]
    const x1 = entry[2]
    const z1 = entry[3]
    return { x0, z0, x1, z1, bottom: 0, top: ceiling }
  })
  const bodyObstacles: [number, number, number, number][] = [...masonry, ...surrounding].filter((o) => o.bottom === 0).map((o) => [o.x0, o.z0, o.x1, o.z1])
  for (const other of room.furniture ?? []) {
    const xState2 = other.rect.map((n) => n * k),
      x = xState2[0],
      z = xState2[1],
      w = xState2[2],
      d = xState2[3]
    bodyObstacles.push([x, z, x + w, z + d])
    if (other === hearth) continue
    if (other.runtime_kind === "table" && other.work_surface) {
      surrounding.push(
        ...workTableSections({ surface: workSurface(other.work_surface, w, d), x: x + w / 2, z: z + d / 2, width: w, depth: d }).map((part) => ({
          x0: part.x0,
          x1: part.x1,
          z0: part.z0,
          z1: part.z1,
          bottom: part.y0,
          top: part.y1,
        })),
      )
    } else surrounding.push({ x0: x, z0: z, x1: x + w, z1: z + d, bottom: 0, top: ceiling })
  }
  return { ceiling, bounds, masonry, surrounding, obstacles: [...masonry, ...surrounding], bodyObstacles }
}
