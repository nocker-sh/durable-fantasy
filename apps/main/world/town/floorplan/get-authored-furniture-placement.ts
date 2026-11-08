import { assertAuthoredFurnitureBounds } from "#/world/town/floorplan/assert-authored-furniture-bounds"
import { getAuthoredGridExtent } from "#/world/town/floorplan/get-authored-grid-extent"
import type { AuthoredRoom } from "#/world/town/floorplan/authored-types"
import type { Placed } from "#/world/town/floorplan/types"

type Props = Readonly<{ room: AuthoredRoom; piece: AuthoredRoom["furniture"][number]; cellM: number }>

/** Preserve explicit furniture metadata and project its rectangle once into the building's coordinates. */
export function getAuthoredFurniturePlacement(props: Props): Placed {
  assertAuthoredFurnitureBounds(props.room, props.piece)
  const piece = props.piece
  return {
    cookingTop: piece.cookingTop,
    hearth: piece.hearth,
    hearthFront: piece.hearthFront,
    shelf: piece.shelf,
    bed: piece.bed,
    workSurface: piece.workSurface,
    seat: piece.seat,
    wallMount: piece.wallMount,
    label: piece.symbol,
    name: piece.name,
    kind: piece.kind,
    solid: piece.solid,
    wall: false,
    floor: props.room.floor,
    ...getAuthoredGridExtent({ cellM: props.cellM, x: props.room.origin[0] + piece.rect[0], z: props.room.origin[1] + piece.rect[1], width: piece.rect[2], depth: piece.rect[3] }),
  }
}
