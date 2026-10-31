import { getInteriorDoorCoordinate } from "#/world/town/get-interior-door-coordinate"
import type { Interior } from "#/world/town/interiors"

/** The ground-floor trigger and arrival must derive from the same measured opening. */
export function assertInteriorEntranceCells(interior: Interior, entrance: NonNullable<Interior["entrance"]>): void {
  const door = [getInteriorDoorCoordinate(entrance.point[0], entrance.outward[0]), getInteriorDoorCoordinate(entrance.point[1], entrance.outward[1])]
  if (door.some((value, axis) => value !== interior.door[axis] || interior.arrive[axis] !== value - entrance.outward[axis] * 2)) throw new Error(`Interior entrance cells disagree: ${interior.id}`)
}
