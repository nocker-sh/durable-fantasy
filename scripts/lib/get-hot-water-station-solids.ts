import { workSurface } from "#/scripts/lib/work-surface"
import { workTableSections } from "#/world/town/work-table"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { HotWaterFrameContext } from "#/scripts/lib/hot-water-frame-types"
type Props = Pick<HotWaterFrameContext, "room" | "review">

/** 身体と器を、同じ天板・脚・取っ手を含む杯の囲いへ照合する。 */
export function getHotWaterStationSolids(props: Props): readonly Cuboid[] | Error {
  if (!props.room.grid) return new Error("Pouring station has no measured grid")
  const table = props.review.layout.table
  const cell = props.room.grid.cell_m
  const x = table.rect[0] * cell
  const z = table.rect[1] * cell
  const width = table.rect[2] * cell
  const depth = table.rect[3] * cell
  const surface = workSurface(table.work_surface, width, depth)
  return [
    ...workTableSections({ surface: surface, x: x + width / 2, z: z + depth / 2, width: width, depth: depth }).map((part) => ({
      x0: part.x0,
      x1: part.x1,
      z0: part.z0,
      z1: part.z1,
      bottom: part.y0,
      top: part.y1,
    })),
    ...props.review.layout.boxes.map((cup) => ({
      x0: x + cup.origin[0],
      x1: x + cup.origin[0] + cup.size[0],
      z0: z + cup.origin[2],
      z1: z + cup.origin[2] + cup.size[2],
      bottom: surface.height,
      top: surface.height + cup.size[1],
    })),
  ]
}
