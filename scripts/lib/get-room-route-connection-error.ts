import { z } from "zod"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { residentDayPlaceSchema } from "#/world/town/resident-day-plan-schema"
const connectionsSchema = z.array(z.object({ kind: z.enum(["door", "opening", "stair"]).optional(), target: z.string().min(1) }))
type Props = Readonly<{ rooms: ReadonlyArray<SettingDocument>; from: z.infer<typeof residentDayPlaceSchema>; to: z.infer<typeof residentDayPlaceSchema> }>

/** The building audit checks reciprocal nominal alignments; this checks that the authored itinerary actually uses them. */
export function getRoomRouteConnectionError(props: Props): Error | null {
  const first = props.rooms[0],
    last = props.rooms.at(-1)
  if (!first || !last) return new Error("Proposed indoor travel has no room sequence")
  if ((props.from.kind === "room" && first.id !== props.from.room) || (props.to.kind === "room" && last.id !== props.to.room))
    return new Error("Proposed indoor travel does not meet its endpoint rooms")
  for (const pair of props.rooms.entries()) {
    const connections = connectionsSchema.safeParse(pair[1].connections),
      next = props.rooms[pair[0] + 1]
    if (!connections.success) return new Error("Proposed indoor travel has invalid connections")
    if (next && !connections.data.some((connection) => connection.target === next.id)) return new Error("Proposed indoor travel skips a room connection")
    if (
      ((pair[0] === 0 && props.from.kind === "district") || (pair[0] === props.rooms.length - 1 && props.to.kind === "district")) &&
      !connections.data.some((connection) => connection.kind !== "stair" && connection.target === pair[1].map)
    )
      return new Error("Proposed indoor travel has no declared outdoor doorway")
  }

  return null
}
