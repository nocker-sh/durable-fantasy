import { roomGridSchema } from "#/scripts/lib/room-layout-schema"
import { getGridBoundaryOpening } from "#/scripts/lib/get-grid-boundary-opening"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ room: SettingDocument; connection: Connection; cellMetres: number }>

/** Only real boundary openings of sufficient physical width can form a traversable door connection. */
export function getRoomConnectionOpening(props: Props) {
  const kind = props.connection.kind ?? "door",
    grid = roomGridSchema.safeParse(props.room.grid),
    span = props.connection.width_cells ?? 1

  if (!["door", "opening"].includes(kind) || !props.connection.door || !grid.success || grid.data.cell_m !== props.cellMetres) return null
  if (!Number.isFinite(span * props.cellMetres) || span * props.cellMetres < MIN_PASSAGE_WIDTH_M) return null

  return getGridBoundaryOpening({ rows: grid.data.rows, door: props.connection.door, span }) ?? null
}
