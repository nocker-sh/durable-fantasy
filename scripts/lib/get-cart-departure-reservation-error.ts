import { z } from "zod"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { getParkedCartDepartureContext } from "#/scripts/lib/get-parked-cart-departure-context"
type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; context: Exclude<ReturnType<typeof getParkedCartDepartureContext>, Error> }>
const connectionsSchema = z.array(z.object({ kind: z.string().optional(), door: z.tuple([z.number(), z.number()]).optional(), target: z.string(), width_cells: z.number().int().positive() }))

/** The departure starts at the real bay and ends with both bodies outside, inside a bounded apron attached only to the actual south exit. */
export function getCartDepartureReservationError(props: Props): Error | null {
  const context = props.context,
    plan = context.plan,
    scale = context.grid.cell_m,
    connections = connectionsSchema.safeParse(props.room.connections)
  if (!connections.success) return new Error("Cart departure has no exterior doorway")
  const exit = connections.data.find(
    (connection) => (connection.kind === undefined || connection.kind === "door") && connection.door?.[0] === plan.exit_door[0] && connection.door[1] === plan.exit_door[1],
  )
  const target = props.documents.get(exit?.target ?? ""),
    operator = props.documents.get(plan.operator),
    apron = plan.exterior_apron.rect_m
  if (!exit || target?.kind !== "maps" || target.town !== props.room.town || plan.exit_door[1] !== context.grid.rows.length - 1)
    return new Error("Cart departure must use the town's south exterior door")
  if (
    operator?.kind !== "residents" ||
    operator.town !== props.room.town ||
    !props.room.design_dependencies ||
    !Array.isArray(props.room.design_dependencies) ||
    !props.room.design_dependencies.includes(plan.operator)
  )
    return new Error("Cart departure has no local operator dependency")
  if (apron[0] !== plan.exit_door[0] * scale || apron[1] !== context.grid.rows.length * scale || apron[2] !== exit.width_cells * scale)
    return new Error("Cart apron does not adjoin the exterior doorway")
  const first = plan.points_m[0],
    last = plan.points_m[plan.points_m.length - 1]
  if (first[0] !== context.origin[0] || first[1] !== context.origin[1]) return new Error("Cart departure does not start at its parked position")
  if (last[1] + context.relative[1] < apron[1] || last[1] - context.operatorOffset - plan.body_radius_m < apron[1]) return new Error("Cart or operator remains inside at the end of departure")

  return null
}
