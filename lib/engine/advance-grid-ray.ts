import type { getGridRayAxis } from "./get-grid-ray-axis"
type Axis = ReturnType<typeof getGridRayAxis>
type Props = { x: Axis; z: Axis }
/** Advance both axes at a corner while retaining its two side cells in the supercover. */
export function advanceGridRay(props: Props) {
  const nextX = props.x.cell === props.x.end ? Infinity : props.x.next,
    nextZ = props.z.cell === props.z.end ? Infinity : props.z.next
  const isCorner = Math.abs(nextX - nextZ) < 1e-12,
    movesX = isCorner || nextX < nextZ,
    movesZ = isCorner || nextZ < nextX
  const x = { ...props.x, cell: props.x.cell + (movesX ? props.x.step : 0), next: movesX ? props.x.next + props.x.interval : props.x.next }
  const z = { ...props.z, cell: props.z.cell + (movesZ ? props.z.step : 0), next: movesZ ? props.z.next + props.z.interval : props.z.next }
  const cells: [number, number][] = []
  if (isCorner) cells.push([x.cell, props.z.cell], [props.x.cell, z.cell])
  cells.push([x.cell, z.cell])
  return { x, z, cells }
}
