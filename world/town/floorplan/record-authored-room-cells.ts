import { canShareRoomCell } from "#/world/town/floorplan/can-share-room-cell"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { getAuthoredProjectionRow } from "#/world/town/floorplan/get-authored-projection-row"
import type { AuthoredPlan, AuthoredRoom } from "#/world/town/floorplan/authored-types"
import type { AuthoredCoverage } from "#/world/town/floorplan/authored-projection-types"

type Props = Readonly<{ source: AuthoredPlan; room: AuthoredRoom; coverage: AuthoredCoverage }>

/** Only identical boundary walls and doors may overlap; exterior walls stay outside the partition set. */
export function recordAuthoredRoomCells(props: Props): void {
  const room = props.room
  const width = room.rows[0].length
  const columns = getIntegerRange(0, width)
  for (const z of getIntegerRange(0, room.rows.length)) {
    const globalZ = room.origin[1] + z
    const row = getAuthoredProjectionRow(props.coverage, room.floor, globalZ)
    for (const x of columns) {
      const globalX = room.origin[0] + x
      const tile = room.rows[z][x]
      const boundary = x === 0 || z === 0 || x === width - 1 || z === room.rows.length - 1
      const previous = row.cells.get(globalX)
      if (previous && !canShareRoomCell(previous, { tile, boundary })) throw new Error(`Overlapping authored rooms: ${room.id}`)
      row.cells.set(globalX, { tile, boundary })
      if (tile === "#" && globalX > 0 && globalX < props.source.width - 1 && globalZ > 0 && globalZ < props.source.depth - 1) row.walls.add(globalX)
    }
  }
}
