import { seatForward } from "#/world/town/seat-forward"
import { seatHeading } from "#/world/town/seat-heading"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import type { ActivitySpot } from "#/world/town/room-fixtures"
import type { ActivityPose } from "#/world/town/activity-pose"

export function projectActivityPose(x0: number, z0: number, spot: ActivitySpot): ActivityPose {
  const facing = spot.seat?.facing ?? "n",
    forward = seatForward(facing)
  return {
    facing: spot.facing ? [x0 + spot.facing[0] * ROOM_SCALE, z0 + spot.facing[1] * ROOM_SCALE] : null,
    seat: spot.seat
      ? {
          at: [x0 + (spot.seat.x + forward[0] * spot.seat.forward) * ROOM_SCALE, z0 + (spot.seat.z + forward[1] * spot.seat.forward) * ROOM_SCALE],
          height: spot.seat.height * ROOM_SCALE,
          heading: seatHeading(facing),
        }
      : null,
  }
}
