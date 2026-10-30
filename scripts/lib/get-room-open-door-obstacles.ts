import { getRoomDoorPortals } from "#/scripts/lib/get-room-door-portals"
import { getRoomOpenDoorPanels } from "#/scripts/lib/get-room-open-door-panels"
import { getRoomDoorThreshold } from "#/scripts/lib/get-room-door-threshold"
import type { DoorPassageObstacle } from "#/scripts/lib/door-passage-obstacle"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** Include every frame, including a neighbour-owned door, for every path through the room. */
export function getRoomOpenDoorObstacles(props: Props) {
  const portals = getRoomDoorPortals(props.room),
    panels = getRoomOpenDoorPanels(props.room),
    obstacles: DoorPassageObstacle[] = []
  if (portals instanceof Error) return portals
  if (panels instanceof Error) return panels
  for (const bounds of panels) obstacles.push({ kind: "leaf", bounds })
  for (const portal of portals) {
    const threshold = getRoomDoorThreshold({ ...props, door: portal.door })
    if (threshold instanceof Error) return new Error(`Door ${portal.door.join(",")}: ${threshold.message}`)
    for (const bounds of threshold.frames) obstacles.push({ kind: "frame", bounds })
  }

  return obstacles
}
