import { compileAuthoredFurniture } from "#/scripts/lib/compile-authored-furniture"
import type { AuthoredRoomSource } from "#/scripts/lib/authored-plan-types"
import type { AuthoredRoom } from "#/world/town/floorplan/authored-types"

type Props = Readonly<{ source: AuthoredRoomSource; floor: number; cellM: number }>

/** Every exported room retains its authored grid, role and explicitly selected furniture. */
export function compileAuthoredRoom(props: Props): AuthoredRoom {
  return {
    id: props.source.document.id,
    name: props.source.name,
    use: props.source.use,
    floor: props.floor,
    origin: props.source.origin,
    rows: props.source.grid.rows,
    furniture: (props.source.document.furniture ?? []).map((furniture) => compileAuthoredFurniture({ furniture, roomId: props.source.document.id, cellM: props.cellM })),
  }
}
