import { getRoomConnectionOpening } from "#/scripts/lib/get-room-connection-opening"
import { getGridBoundarySide } from "#/scripts/lib/get-grid-boundary-side"
import type { AuthoredRoomSource, AuthoredEntrance } from "#/scripts/lib/authored-plan-types"
import type { Layout } from "#/scripts/lib/building-layout"

type Props = Readonly<{ source: AuthoredRoomSource; outsideMap: unknown; layout: Layout; floor: number }>

/** Preserve the authored entry's cell-centre convention; never infer an exterior entrance from a declaration alone. */
export function getAuthoredRoomEntries(props: Props): AuthoredEntrance[] {
  if (props.floor !== 0) return []
  const entries: AuthoredEntrance[] = [],
    source = props.source
  for (const connection of source.connections) {
    if (connection.target !== props.outsideMap) continue
    if (!connection.door) throw new Error(`Missing entrance position: ${source.document.id}`)
    const opening = getRoomConnectionOpening({ room: source.document, connection, cellMetres: props.layout.cell_m })
    if (!opening) throw new Error(`Invalid authored entrance opening: ${source.document.id}`)
    const x = source.origin[0] + connection.door[0],
      z = source.origin[1] + connection.door[1]
    const side = getGridBoundarySide({ point: [x, z], outward: opening.outward, width: props.layout.width, depth: props.layout.depth })
    if (!side) throw new Error(`Entrance is not on an exterior wall: ${source.document.id}`)
    const width = connection.width_cells ?? 1,
      offset = (width - 1) / 2,
      horizontal = side === "n" || side === "s"
    entries.push({ at: [x + (horizontal ? offset : 0), z + (horizontal ? 0 : offset)], side, width })
  }
  return entries
}
