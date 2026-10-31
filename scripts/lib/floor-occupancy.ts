type Props = Readonly<{ width: number; depth: number }>
type Room = Readonly<{ id: string; origin: readonly [number, number]; rows: readonly string[] }>

/** 一階分の占有を集め、共有する壁と戸口以外の重なりを拒否する。立体の重なりは扱わない。 */
export class FloorOccupancy {
  private readonly cells = new Map<string, string>()

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
          previous = this.cells.get(key)
        if (x < 0 || z < 0 || x >= this.props.width || z >= this.props.depth) errors.push(`${room.id}: outside building`)
        if (previous !== undefined && !(previous === cell[1] && ["#", "D"].includes(cell[1]))) errors.push(`${room.id}: conflicting room overlap at ${key}`)
        this.cells.set(key, cell[1])
      }
    }

    return errors
  }
}
