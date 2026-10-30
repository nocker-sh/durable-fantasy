import { scaleSeat } from "#/world/town/scale-seat"
import { scaleWorkSurface } from "#/world/town/scale-work-surface"
import { scaleHearth } from "#/world/town/scale-hearth"
import { scaleShelf } from "#/world/town/scale-shelf"
import { scaleBed } from "#/world/town/scale-bed"
import type { Placed } from "#/world/town/floorplan/types"

/** Scale physical metadata once; grid bounds, identity, floor and facing remain in the authored plan for the separate placement transform. */
export function scaleRoomPieceDimensions(piece: Placed, scale: number): Placed {
  if (!Number.isFinite(scale) || scale <= 0) throw new Error("Invalid room piece scale")

  return {
    ...piece,
    cookingTop: piece.cookingTop
      ? { thickness: piece.cookingTop.thickness * scale, frontDepth: piece.cookingTop.frontDepth * scale, minimumBearing: piece.cookingTop.minimumBearing * scale }
      : undefined,
    hearth: piece.hearth ? scaleHearth(piece.hearth, scale) : undefined,
    shelf: piece.shelf ? scaleShelf(piece.shelf, scale) : undefined,
    bed: piece.bed ? scaleBed(piece.bed, scale) : undefined,
    workSurface: piece.workSurface ? scaleWorkSurface(piece.workSurface, scale) : undefined,
    seat: piece.seat ? scaleSeat(piece.seat, scale) : undefined,
    wallMount: piece.wallMount ? { ...piece.wallMount, bottom: piece.wallMount.bottom * scale, height: piece.wallMount.height * scale } : undefined,
  }
}
