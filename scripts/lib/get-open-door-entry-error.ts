import type { DoorPassageObstacle } from "#/scripts/lib/door-passage-obstacle"
import { getRoomDoorThreshold } from "#/scripts/lib/get-room-door-threshold"
import { getOpenDoorPolylineError } from "#/scripts/lib/get-open-door-polyline-error"
import type { z } from "zod"
import type { openDoorPassagesSchema } from "#/scripts/lib/open-door-passages-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Plan = z.infer<typeof openDoorPassagesSchema>
type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; plan: Plan; entry: Plan["entries"][number]; obstacles: ReadonlyArray<DoorPassageObstacle> }>

/** Match the declared route to its actual threshold and hub before testing continuous clearance. */
export function getOpenDoorEntryError(props: Props): Error | null {
  const threshold = getRoomDoorThreshold({ room: props.room, door: props.entry.door, documents: props.documents })
  if (threshold instanceof Error) return threshold
  if (threshold.clearWidth + 1e-9 < props.plan.body_radius_m * 2) return new Error("Open passage body exceeds its fitted aperture")
  const points = props.entry.points_m,
    first = points[0],
    last = points[points.length - 1],
    hub = props.plan.hub_m
  if (
    Math.hypot(first[0] - threshold.point[0], first[1] - threshold.point[1]) > 1e-9 ||
    Math.hypot(last[0] - hub[0], last[1] - hub[1]) > 1e-9 ||
    Math.hypot(first[0] - last[0], first[1] - last[1]) <= 1e-9
  )
    return new Error("Open passage does not connect its threshold and room hub")

  return getOpenDoorPolylineError({ room: props.room, points, bodyRadius: props.plan.body_radius_m, obstacles: props.obstacles })
}
