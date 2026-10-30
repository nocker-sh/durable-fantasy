import { getSweptGridClearanceError } from "./get-swept-grid-clearance-error"
import { segmentRectDistance } from "./segment-rect-distance"
type Props = Readonly<{
  points: ReadonlyArray<readonly [number, number]>
  radius: number
  cellSize: number
  isCellFree: (cell: readonly [number, number]) => boolean
  obstacles: ReadonlyArray<readonly [number, number, number, number]>
}>

/** Check every complete capsule against supported cells and explicit obstacles; callers retain their own labels and waypoint policies. */
export function getCirclePolylineClearance(props: Props): Error | Readonly<{ obstacle: number }> | null {
  if (props.points.length < 2) return new Error("Polyline needs at least two points")
  if (props.obstacles.some((rect) => !rect.every(Number.isFinite) || rect[0] > rect[2] || rect[1] > rect[3])) return new Error("Invalid polyline obstacle")
  for (const index of props.points.keys()) {
    if (index === 0) continue
    const from = props.points[index - 1],
      to = props.points[index]
    const floor = getSweptGridClearanceError({ from, to, radius: props.radius, cellSize: props.cellSize, isCellFree: props.isCellFree })
    if (floor) return floor
    for (const obstacle of props.obstacles.keys()) if (segmentRectDistance(props.obstacles[obstacle], from, to) < props.radius - 1e-9) return { obstacle }
  }

  return null
}
