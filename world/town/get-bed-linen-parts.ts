import { rectangleFace } from "#/lib/engine/rectangle-face"
import { getBedLinenLayoutError } from "#/world/town/get-bed-linen-layout-error"
import type { BedLinenItem, BedPart } from "#/world/town/bed-types"
import type { getBedFrameParts } from "#/world/town/get-bed-frame-parts"
type Props = Parameters<typeof getBedFrameParts>[0] & { linen: readonly BedLinenItem[] }

/** Made-bed pieces use the actual mattress's head-relative plane; neither rails nor overlapping pieces count as support. */
export function getBedLinenParts(props: Props): readonly BedPart[] | Error {
  const width = props.size[0] - 2 * props.bed.railWidth,
    depth = props.size[1] - 2 * props.bed.railWidth
  if (![...props.at, props.floor, width, depth].every(Number.isFinite) || width <= 0 || depth <= 0) return new Error("Bed linen has no mattress support")
  const face = rectangleFace({ x: props.at[0], z: props.at[1], width: width, depth: depth, side: props.bed.headSide }),
    along = face.outward[0] === 0 ? depth : width
  const error = getBedLinenLayoutError({ linen: props.linen, width: face.span, length: along, availableHeight: props.bed.headHeight - props.bed.frameHeight - props.bed.mattressThickness })
  if (error) return error
  const across = [-face.outward[1], face.outward[0]],
    bottom = props.floor + props.bed.frameHeight + props.bed.mattressThickness

  return props.linen.map((piece) => {
    const x = face.point[0] + across[0] * (piece.across + piece.width / 2 - face.span / 2) - face.outward[0] * (piece.fromHead + piece.length / 2),
      z = face.point[1] + across[1] * (piece.across + piece.width / 2 - face.span / 2) - face.outward[1] * (piece.fromHead + piece.length / 2)
    const halfX = (Math.abs(across[0]) * piece.width + Math.abs(face.outward[0]) * piece.length) / 2,
      halfZ = (Math.abs(across[1]) * piece.width + Math.abs(face.outward[1]) * piece.length) / 2
    return { kind: piece.kind, x0: x - halfX, x1: x + halfX, y0: bottom, y1: bottom + piece.thickness, z0: z - halfZ, z1: z + halfZ }
  })
}
