import { workTableSections } from "#/world/town/work-table"
import { workSurface } from "#/scripts/lib/work-surface"
import { storageLidPlan } from "#/world/town/storage-lid-plan"
import { certifyStorageLid } from "#/world/town/certify-storage-lid"
import { storageLidState } from "#/world/town/storage-lid-state"
import { shelfParts } from "#/world/town/shelf-parts"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { shelfLidHandle } from "#/world/town/shelf-lid-handle"
import type { ShelfSpec, ShelfItem } from "#/world/town/shelf"
import { storageRetrieval } from "#/world/town/storage-retrieval"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import { hearthRoomSection } from "#/scripts/lib/hearth-room-section"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { compileRoomDetails } from "#/scripts/lib/room-details"
import { roomEnvelopeObstacles } from "#/scripts/lib/room-envelope-obstacles"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { AshReceiver } from "#/scripts/lib/hearth-maintenance"
type Furniture = NonNullable<SettingDocument["furniture"]>[number]
const EPS = 1e-9
/** Replace the moved item with its actual floor state; keep all other shelf frames and contents. */
type Props = {
  room: SettingDocument
  building: SettingDocument
  documents: ReadonlyMap<string, SettingDocument>
  rack: Furniture
  shelf: ShelfSpec
  item: ShelfItem
  motion: ReturnType<typeof storageRetrieval>
  rest: AshReceiver["lid_rest"]
}
export function ashLidRestPlan(props: Props) {
  const room = props.room
  const building = props.building
  const documents = props.documents
  const rack = props.rack
  const shelf = props.shelf
  const item = props.item
  const motion = props.motion
  const rest = props.rest

  if (!room.grid || rest.box_support !== "floor" || rest.furniture !== rack.symbol || !item.lidHandle || item.wall === undefined || item.lid === undefined || item.lidLift === undefined)
    throw new Error("Ash lid needs its dedicated shelf top and floor support")
  const k = room.grid.cell_m,
    xState = rack.rect.map((v) => v * k),
    x = xState[0],
    z = xState[1],
    w = xState[2],
    d = xState[3],
    cxState = rest.position_m,
    cx = cxState[0],
    cz = cxState[1],
    plan = storageLidPlan({ withdrawn: motion.to, wall: item.wall, lid: item.lid, handle: shelfLidHandle(shelf, item)!, lift: item.lidLift, rest: [cx, shelf.height, cz] }),
    placed = storageLidState(plan, plan.offsets.length - 1).find((p) => p.part === "lid")!
  if (![cx, cz].every(Number.isFinite) || placed.x0 < x - EPS || placed.x1 > x + w + EPS || placed.z0 < z - EPS || placed.z1 > z + d + EPS)
    throw new Error("Ash lid is not fully supported by its shelf top")
  const level = (building.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[] | undefined)?.find((l) => l.floor === room.floor),
    ceiling = level ? level.ceiling_elevation_m - level.elevation_m : NaN,
    obstacles: Cuboid[] = roomEnvelopeObstacles(room).map((entry) => {
      const x0 = entry[0]
      const z0 = entry[1]
      const x1 = entry[2]
      const z1 = entry[3]
      return { x0, z0, x1, z1, bottom: 0, top: ceiling }
    }),
    box = (p: { x0: number; x1: number; z0: number; z1: number; y0: number; y1: number }): Cuboid => ({ x0: p.x0, x1: p.x1, z0: p.z0, z1: p.z1, bottom: p.y0, top: p.y1 })
  const tableColumns = new Set<Cuboid>(),
    tableParts: Cuboid[] = []
  for (const f of room.furniture ?? []) {
    const xState2 = f.rect.map((n) => n * k),
      x = xState2[0],
      z = xState2[1],
      w = xState2[2],
      d = xState2[3]
    if (f.runtime_kind === "shelf") {
      const source = shelfDimensions(f.shelf, w, d),
        actual = f.symbol === rack.symbol ? { ...source, items: source.items?.filter((i) => i.id !== item.id) } : source
      obstacles.push(
        ...shelfParts({ x: x + w / 2, z: z + d / 2, width: w, depth: d, floor: 0, shelf: actual }).map(box),
        ...shelfItemParts({ x: x + w / 2, z: z + d / 2, width: w, depth: d, floor: 0, shelf: actual }).map(box),
      )
    } else {
      const column = { x0: x, x1: x + w, z0: z, z1: z + d, bottom: 0, top: ceiling }
      obstacles.push(column)
      if (f.runtime_kind === "table" && f.work_surface) {
        tableColumns.add(column)
        tableParts.push(
          ...workTableSections({ surface: workSurface(f.work_surface, w, d), x: x + w / 2, z: z + d / 2, width: w, depth: d }).map((part) => ({
            x0: part.x0,
            x1: part.x1,
            z0: part.z0,
            z1: part.z1,
            bottom: part.y0,
            top: part.y1,
          })),
        )
      }
    }
    if (f.runtime_kind === "hearth") obstacles.push(...hearthRoomSection({ room: room, building: building, documents: documents, hearth: f }).masonry)
  }
  const oxState = room.origin as number[],
    ox = oxState[0],
    oz = oxState[1]
  for (const detail of compileRoomDetails(building, [room])) obstacles.push({ x0: detail.x0 - ox * k, x1: detail.x1 - ox * k, z0: detail.z0 - oz * k, z1: detail.z1 - oz * k, bottom: 0, top: ceiling })
  for (const lamp of (room.lamps ?? []) as { position_m: number[]; bottom_m: number; diameter_m: number }[]) {
    const xState3 = lamp.position_m,
      x = xState3[0],
      z = xState3[1],
      r = lamp.diameter_m / 2
    obstacles.push({ x0: x - r, x1: x + r, z0: z - r, z1: z + r, bottom: lamp.bottom_m, top: ceiling })
  }
  const section = { bounds: { x0: 0, x1: room.grid.rows[0].length * k, z0: 0, z1: room.grid.rows.length * k }, ceiling, obstacles }
  certifyStorageLid(plan, section)
  const carrierSection = { ...section, obstacles: [...obstacles.filter((obstacle) => !tableColumns.has(obstacle)), ...tableParts] }
  return { plan, section, carrierSection }
}
