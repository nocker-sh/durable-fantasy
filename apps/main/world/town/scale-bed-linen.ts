import type { BedLinenItem } from "#/world/town/bed-types"

/** Preserve individual linen identities while converting every physical measurement exactly once. */
export function scaleBedLinen(linen: readonly BedLinenItem[] | null, scale: number): readonly BedLinenItem[] | null {
  if (!Number.isFinite(scale) || scale <= 0) throw new Error("Invalid bed scale")
  if (linen === null) return null

  return linen.map((piece) => ({
    ...piece,
    across: piece.across * scale,
    fromHead: piece.fromHead * scale,
    width: piece.width * scale,
    length: piece.length * scale,
    thickness: piece.thickness * scale,
  }))
}
