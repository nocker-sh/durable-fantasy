import type { DoorPassageObstacle } from "#/scripts/lib/door-passage-obstacle"
import { getCirclePolylineClearance } from "#/lib/engine/get-circle-polyline-clearance"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; points: ReadonlyArray<readonly [number, number]>; bodyRadius: number; obstacles: ReadonlyArray<DoorPassageObstacle> }>

/** Certify every whole segment of the declared circle, not point samples or a grid with the open leaf omitted. */
export function getOpenDoorPolylineError(props: Props): Error | null {
  const grid = props.room.grid
  if (!grid || props.points.length < 2 || !Number.isFinite(props.bodyRadius) || props.bodyRadius <= 0) return new Error("Invalid open door path")
  const clearance = getCirclePolylineClearance({
    points: props.points,
    radius: props.bodyRadius,
    cellSize: grid.cell_m,
    isCellFree: (cell) => [".", "D"].includes(grid.rows[cell[1]]?.[cell[0]] ?? "#"),
    obstacles: props.obstacles.map((obstacle) => obstacle.bounds),
  })
  if (clearance instanceof Error || clearance === null) return clearance

  return new Error(`Open passage intersects a fitted door ${props.obstacles[clearance.obstacle].kind}`)
}
