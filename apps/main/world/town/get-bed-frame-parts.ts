import type { BedSpec, BedPart } from "#/world/town/bed-types"
type Props = { at: readonly [number, number]; size: readonly [number, number]; floor: number; bed: BedSpec }

/** The unchanged frame, deck and mattress share floor-standing legs and one explicit headboard side. */
export function getBedFrameParts(props: Props): readonly BedPart[] {
  const bed = props.bed,
    width = props.size[0],
    depth = props.size[1],
    height = bed.frameHeight,
    rail = bed.railWidth,
    leg = bed.legWidth
  if (
    ![width, depth, height, bed.deckThickness, rail, bed.railHeight, leg, bed.headHeight, bed.mattressThickness].every((value) => Number.isFinite(value) && value > 0) ||
    ![...props.at, props.floor].every(Number.isFinite) ||
    2 * Math.max(rail, leg) >= Math.min(width, depth) ||
    bed.deckThickness >= height ||
    bed.railHeight >= height ||
    bed.headHeight <= height + bed.mattressThickness ||
    !["n", "s", "w", "e"].includes(bed.headSide)
  )
    throw new Error("Invalid bed dimensions")
  const left = props.at[0] - width / 2,
    right = props.at[0] + width / 2,
    north = props.at[1] - depth / 2,
    south = props.at[1] + depth / 2,
    parts: BedPart[] = []
  const box = (kind: BedPart["kind"], from: readonly [number, number, number], to: readonly [number, number, number]) =>
    parts.push({ kind, x0: from[0], y0: props.floor + from[1], z0: from[2], x1: to[0], y1: props.floor + to[1], z1: to[2] })
  for (const x of [left, right - leg]) for (const z of [north, south - leg]) box("frame", [x, 0, z], [x + leg, height - bed.deckThickness, z + leg])
  for (const edge of [
    [left, north, left + rail, south],
    [right - rail, north, right, south],
    [left + rail, north, right - rail, north + rail],
    [left + rail, south - rail, right - rail, south],
  ])
    box("frame", [edge[0], height - bed.railHeight, edge[1]], [edge[2], height, edge[3]])
  box("deck", [left + rail, height - bed.deckThickness, north + rail], [right - rail, height, south - rail])
  box("mattress", [left + rail, height, north + rail], [right - rail, height + bed.mattressThickness, south - rail])
  const side = bed.headSide
  box("frame", [side === "e" ? right - rail : left, height, side === "s" ? south - rail : north], [side === "w" ? left + rail : right, bed.headHeight, side === "n" ? north + rail : south])

  return parts
}
