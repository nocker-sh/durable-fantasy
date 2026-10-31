import { roomGridSchema } from "#/scripts/lib/room-layout-schema"
import { getRoomDoorwayReview } from "#/scripts/lib/get-room-doorway-review"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ room: SettingDocument; connection: Connection; cellMetres: number }>

/** Only real boundary openings of sufficient physical width can form a traversable door connection. */
export function getRoomConnectionOpening(props: Props) {
  const kind = props.connection.kind ?? "door",
    grid = roomGridSchema.safeParse(props.room.grid),
    span = props.connection.width_cells ?? 1

  if (!["door", "opening"].includes(kind) || !props.connection.door || !grid.success || grid.data.cell_m !== props.cellMetres) return null
  const review = getRoomDoorwayReview({ rows: grid.data.rows, door: props.connection.door, span, cellMetres: props.cellMetres })
  if (review.errors.length) return null

  return review.opening
}
