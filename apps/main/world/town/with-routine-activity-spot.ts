import { ROOM_SCALE } from "#/world/town/interior-rules"
import type { Cell, Interior } from "#/world/town/interiors"
import type { Slot } from "#/world/town/routine-types"

type Props = Readonly<{ name: string; slot: Slot; rooms: readonly Interior[] }>

/** Resolve an authored activity on its own floor; preserve the original slot when no matching assignment exists. */
export function withRoutineActivitySpot(props: Props): Slot {
  const activity = props.slot.activity
  if (!activity) return props.slot

  for (const room of props.rooms) {
    const placed = room.house.authored?.activitySpots.find(
      (spot) => spot.resident === props.name && spot.kind === activity.kind && spot.role === (activity.kind === "lesson" ? activity.role : undefined) && spot.floor === room.floor,
    )
    if (!placed) continue

    const cell: Cell = [Math.floor((room.x0 + placed.x * ROOM_SCALE) * 2), Math.floor((room.z0 + placed.z * ROOM_SCALE) * 2)]
    return { ...props.slot, where: { map: room.id, cell } }
  }
  return props.slot
}
