import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import type { BedLinenItem } from "#/world/town/bed-types"
type Props = { linen: readonly BedLinenItem[]; width: number; length: number; availableHeight: number }

/** A made bed has one head pillow and one separate foot blanket, wholly supported between the rails. */
export function getBedLinenLayoutError(props: Props): Error | null {
  const pillow = props.linen.find((piece) => piece.kind === "pillow"),
    blanket = props.linen.find((piece) => piece.kind === "blanket")
  if (props.linen.length !== 2 || !pillow || !blanket) return new Error("A made bed needs one pillow and one blanket")
  const height = Math.max(...props.linen.map((piece) => piece.thickness))
  if (!Number.isFinite(props.availableHeight) || height >= props.availableHeight) return new Error("Bed linen buries its headboard")
  if (pillow.fromHead + pillow.length > blanket.fromHead) return new Error("Pillow must remain above the blanket")

  return getBoxLayoutError({
    size: [props.width, height, props.length],
    boxes: props.linen.map((piece) => ({ id: piece.id, origin: [piece.across, 0, piece.fromHead], size: [piece.width, piece.thickness, piece.length] })),
    gap: 0,
  })
}
