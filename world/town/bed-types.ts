export type BedLinenItem = Readonly<{ id: string; kind: "pillow" | "blanket"; across: number; fromHead: number; width: number; length: number; thickness: number }>
export type BedSpec = Readonly<{
  frameHeight: number
  deckThickness: number
  railWidth: number
  railHeight: number
  legWidth: number
  headHeight: number
  mattressThickness: number
  headSide: "n" | "s" | "w" | "e"
  linen: readonly BedLinenItem[] | null
}>
export type BedPart = Readonly<{ kind: "frame" | "deck" | "mattress" | "pillow" | "blanket"; x0: number; y0: number; z0: number; x1: number; y1: number; z1: number }>
