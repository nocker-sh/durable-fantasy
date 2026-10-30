import { workTableSections } from "#/world/town/work-table"
import { footRestSections, type FootRestSection } from "#/world/town/foot-rest"
import type { SeatSpec } from "#/world/town/room-fixtures"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { workSurface } from "#/scripts/lib/work-surface"

type Furniture = NonNullable<SettingDocument["furniture"]>[number]
const overlaps = (a: FootRestSection, b: Omit<FootRestSection, "part">) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0 && a.z0 < b.z1 && a.z1 > b.z0

type Props = {
  item: Furniture
  seat: SeatSpec
  furniture: readonly Furniture[]
  cell: number
}
export function auditFootRest(props: Props): string[] {
  const item = props.item
  const seat = props.seat
  const furniture = props.furniture
  const cell = props.cell

  const rest = seat.footRest
  const xState = item.rect.map((value) => value * cell),
    x = xState[0],
    z = xState[1],
    width = xState[2],
    depth = xState[3]
  if (!rest || rest.forward + rest.depth / 2 <= (seat.facing === "e" || seat.facing === "w" ? width : depth) / 2) return []
  const table = furniture.find((candidate) => candidate.symbol === item.seat?.foot_rest?.under_table)
  if (!table?.work_surface || !table.seat_symbols?.includes(item.symbol)) return ["extended foot rest has no assigned table"]
  if (!Array.isArray(table.rect) || table.rect.length !== 4 || !table.rect.every(Number.isFinite)) return ["foot rest table has no valid footprint"]
  const txState = table.rect.map((value) => value * cell),
    tx = txState[0],
    tz = txState[1],
    tw = txState[2],
    td = txState[3]
  let surface
  try {
    surface = workSurface(table.work_surface, tw, td)
  } catch {
    return ["foot rest table has invalid dimensions"]
  }
  const sections = footRestSections({ seat: seat, x: x + width / 2, z: z + depth / 2 })
  const board = sections[0],
    errors: string[] = []
  if (board.x0 < tx || board.x1 > tx + tw || board.z0 < tz || board.z1 > tz + td) errors.push("foot rest extends outside its table")
  const tableSections = workTableSections({ surface: surface, x: tx + tw / 2, z: tz + td / 2, width: tw, depth: td })
  if (rest.height >= tableSections[0].y0) errors.push("foot rest meets tabletop")
  const collisions = new Set<string>()
  for (const leg of tableSections.filter((section) => section.part === "leg")) {
    for (const section of sections) if (overlaps(section, leg)) collisions.add(section.part)
  }
  if (collisions.has("board")) errors.push("foot rest meets table leg")
  if (collisions.has("bearer")) errors.push("foot rest bearer meets table leg")
  return errors
}
