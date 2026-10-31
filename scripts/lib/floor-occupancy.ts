import { canShareRoomCell } from "#/world/town/floorplan/can-share-room-cell"
import type { RoomCell } from "#/world/town/floorplan/room-cell-types"

type Props = Readonly<{ width: number; depth: number }>
type Room = Readonly<{ id: string; origin: readonly [number, number]; rows: readonly string[] }>

/** 一階分の占有を集め、共有する壁と戸口以外の重なりを拒否する。立体の重なりは扱わない。 */
export class FloorOccupancy {
  private readonly cells = new Map<string, RoomCell>()

  constructor(private readonly props: Props) {
    this.props = Object.freeze({ width: props.width, depth: props.depth })
    Object.freeze(this)
  }

  get size(): number {
    return this.cells.size
  }

  addRoom(room: Room): string[] {
    const errors: string[] = []

    for (const row of room.rows.entries()) {
      for (const cell of row[1].split("").entries()) {
        const x = room.origin[0] + cell[0],
          z = room.origin[1] + row[0],
          key = `${x},${z}`,
          previous = this.cells.get(key),
          boundary = cell[0] === 0 || row[0] === 0 || cell[0] === row[1].length - 1 || row[0] === room.rows.length - 1
        if (x < 0 || z < 0 || x >= this.props.width || z >= this.props.depth) errors.push(`${room.id}: outside building`)
        if (previous !== undefined && !canShareRoomCell(previous, { tile: cell[1], boundary })) errors.push(`${room.id}: conflicting room overlap at ${key}`)
        this.cells.set(key, { tile: cell[1], boundary })
      }
    }

    return errors
  }
}
