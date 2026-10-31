import { getRoomDoorwayReview } from "#/scripts/lib/get-room-doorway-review"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ roomId: string; rows: readonly string[]; cellMetres: number }>

/** 一室の戸口セルと接続宣言を照合する。開口の幅は実際のグリッドで検証してから列挙する。 */
export class RoomDoorwayInventory {
  private readonly declaredDoors = new Set<string>()

  constructor(private readonly props: Props) {
    this.props = Object.freeze({ ...props, rows: Object.freeze([...props.rows]) })
    Object.freeze(this)
  }

  addConnection(connection: Connection): readonly string[] {
    if (!connection.door) return []
    const span = connection.width_cells ?? 1
    const review = getRoomDoorwayReview({ rows: this.props.rows, door: connection.door, span, cellMetres: this.props.cellMetres })
    const errors = review.errors.map((error) => `${this.props.roomId}: ${error}`),
      opening = review.opening
    if (!opening) return errors
    for (const offset of Array.from({ length: span }, (_value, index) => index)) {
      const x = opening.cell[0] + (opening.outward[0] === 0 ? offset : 0),
        z = opening.cell[1] + (opening.outward[0] === 0 ? 0 : offset),
        key = `${x},${z}`
      if (this.declaredDoors.has(key)) errors.push(`${this.props.roomId}: doorway cell has multiple connections`)
      this.declaredDoors.add(key)
    }
    return errors
  }

  getMissingConnectionErrors(): readonly string[] {
    const errors: string[] = []

    for (const row of this.props.rows.entries()) {
      for (const cell of row[1].split("").entries()) {
        if (cell[1] === "D" && !this.declaredDoors.has(`${cell[0]},${row[0]}`)) errors.push(`${this.props.roomId}: doorway cell has no connection at ${cell[0]},${row[0]}`)
      }
    }

    return errors
  }
}
