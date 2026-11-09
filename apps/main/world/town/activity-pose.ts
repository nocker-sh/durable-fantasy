import { INTERIORS } from "#/world/town/interiors"
import { slotAt } from "#/world/town/slot-at"
import { projectActivityPose } from "#/world/town/project-activity-pose"

type Point = [number, number]

export type ActivityPose = {
  facing: Point | null
  seat: { at: Point; height: number; heading: number } | null
}

const identity = (activity: { kind: string; role?: string }) => `${activity.kind}:${activity.role ?? ""}`

/** Project the authored positions once; each caller receives its own mutable pose below. */
const poses = new Map<string, Map<string, Map<string, ActivityPose>>>()

for (const room of INTERIORS) {
  const residents = new Map<string, Map<string, ActivityPose>>()
  for (const spot of room.house.authored?.activitySpots ?? []) {
    if (spot.floor !== room.floor) continue
    const activities = residents.get(spot.resident) ?? new Map<string, ActivityPose>()
    if (!residents.has(spot.resident)) residents.set(spot.resident, activities)
    const key = identity(spot)
    if (activities.has(key)) throw new Error(`Duplicate activity place: ${room.id}/${spot.resident}/${key}`)
    activities.set(key, projectActivityPose(room.x0, room.z0, spot))
  }
  if (residents.size) poses.set(room.id, residents)
}

/** One schedule lookup supplies both the body and its facing, only on the assigned map. */
export function activityPose(name: string, minute: number, map: string): ActivityPose | null {
  const slot = slotAt(name, minute)
  if (!slot?.activity || typeof slot.where === "string" || slot.where.map !== map) return null
  const pose = poses.get(map)?.get(name)?.get(identity(slot.activity))
  if (!pose) return null
  // Seated bodies keep the chair's direction, measured from the actual talk/access cell.
  const facing: Point | null =
    pose.seat && "cell" in slot.where
      ? [(slot.where.cell[0] + 0.5) / 2 + Math.sin(pose.seat.heading), (slot.where.cell[1] + 0.5) / 2 + Math.cos(pose.seat.heading)]
      : pose.facing
        ? [...pose.facing]
        : null
  return {
    facing,
    seat: pose.seat ? { ...pose.seat, at: [...pose.seat.at] } : null,
  }
}
