import { getInteriorDoorCoordinate } from "#/world/town/get-interior-door-coordinate"
import { interiorCellOf } from "#/world/town/interior-cell-of"
import type { Cell } from "#/world/town/interiors"
import type { FloorPlan } from "#/world/town/floorplan/types"

type Props = Readonly<{ entrance: FloorPlan["entrance"]; door: number; x0: number; z0: number; z1: number; scale: number }>

/** Entrance geometry and its collision cell share one projection, with the legacy south door kept explicit. */
export function getInteriorEntrance(props: Props) {
  const source = props.entrance
  const point: Cell | undefined = source ? [props.x0 + source.point[0] * props.scale, props.z0 + source.point[1] * props.scale] : undefined
  const entrance = source && point ? { point, outward: source.outward } : undefined
  const door: Cell = entrance
    ? [getInteriorDoorCoordinate(entrance.point[0], entrance.outward[0]), getInteriorDoorCoordinate(entrance.point[1], entrance.outward[1])]
    : interiorCellOf(props.x0 + props.door * props.scale, props.z1 - 0.25)
  const outward = entrance?.outward ?? [0, 1]
  const arrive: Cell = [door[0] - outward[0] * 2, door[1] - outward[1] * 2]
  return { entrance, door, arrive }
}
