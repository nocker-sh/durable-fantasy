import { getFurnitureKind } from "#/world/town/get-furniture-kind"
import type { Placed } from "#/world/town/floorplan/types"
import type { Furniture, UnrenderedFurniture } from "#/world/town/interiors"
type Props = Readonly<{
  piece: Readonly<Pick<Placed, "name" | "solid" | "on" | "kind" | "wallMount" | "seat" | "workSurface" | "bed" | "shelf" | "hearthFront" | "hearth" | "cookingTop">>
  placement: Readonly<Pick<Furniture, "x" | "z" | "w" | "d">>
}>

/** Preserve unsupported records and authored geometry; traces retain their established nonblocking representation. */
export function getInteriorPiece(props: Props): Furniture | UnrenderedFurniture {
  const piece = props.piece,
    kind = piece.kind ?? getFurnitureKind(piece.name)
  const furniture = {
    ...props.placement,
    ...(piece.cookingTop ? { cookingTop: piece.cookingTop } : {}),
    ...(piece.hearth ? { hearth: piece.hearth } : {}),
    ...(piece.hearthFront ? { hearthFront: piece.hearthFront } : {}),
    ...(piece.shelf ? { shelf: piece.shelf } : {}),
    ...(piece.bed ? { bed: piece.bed } : {}),
    ...(piece.workSurface ? { workSurface: piece.workSurface } : {}),
    ...(piece.seat ? { seat: piece.seat } : {}),
    solid: piece.solid && !piece.on && kind !== "trace",
    name: piece.name,
    ...(piece.on ? { on: piece.on } : {}),
    ...(piece.wallMount ? { wallMount: piece.wallMount } : {}),
  }
  if (piece.on) return { kind: "trace", ...furniture }
  if (kind === null) return furniture

  return { kind, ...furniture }
}
