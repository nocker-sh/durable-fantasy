export type RectangleSide = "n" | "s" | "w" | "e"
type Props = { x: number; z: number; width: number; depth: number; side: RectangleSide }
/** Centre, outward normal and tangent width of one face of an axis-aligned rectangle. */
export function rectangleFace(props: Props) {
  const x = props.x,
    z = props.z,
    width = props.width,
    depth = props.depth,
    side = props.side
  if (![x, z, width, depth].every(Number.isFinite) || width <= 0 || depth <= 0 || !["n", "s", "w", "e"].includes(side)) throw new Error("Invalid rectangle face")
  const nx = side === "e" ? 1 : side === "w" ? -1 : 0,
    nz = side === "s" ? 1 : side === "n" ? -1 : 0
  return { point: [x + (nx * width) / 2, z + (nz * depth) / 2] as const, outward: [nx, nz] as const, span: nx ? depth : width }
}
