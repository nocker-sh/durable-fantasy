import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import type { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
type Props = Readonly<{ plan: z.infer<typeof stockLockSchema>; site: z.infer<typeof stockLockSiteSchema>; metresPerTile: number }>

/** Project the entire enclosure and both finite floor reservations without shrinking the authored grid. */
export function getStockLockSiteGeometry(props: Props) {
  const plan = props.plan,
    origin = props.site.origin_tiles,
    metres = props.metresPerTile
  if (![...origin, metres].every(Number.isFinite) || metres <= 0) return new Error("Invalid stock lock site scale or origin")
  const localRects = [[0, 0, plan.layout.rows[0].length * plan.layout.cell_m, plan.layout.rows.length * plan.layout.cell_m], plan.walking.outside_side.rect_m, plan.pasture_side.rect_m]
  const rectangles = localRects.map(
    (rect) =>
      [origin[0] + rect[0] / metres, origin[1] + rect[1] / metres, origin[0] + (rect[0] + rect[2]) / metres, origin[1] + (rect[1] + rect[3]) / metres] satisfies readonly [
        number,
        number,
        number,
        number,
      ],
  )
  if (rectangles.some((rect) => !rect.every(Number.isFinite) || rect[0] >= rect[2] || rect[1] >= rect[3])) return new Error("Unbounded stock lock site reservation")
  const point = props.site.road_connection.point_m,
    connection: readonly [number, number] = [origin[0] + point[0] / metres, origin[1] + point[1] / metres]
  if (!connection.every(Number.isFinite)) return new Error("Unbounded stock lock road connection")

  return { enclosure: rectangles[0], outside: rectangles[1], pasture: rectangles[2], connection }
}
