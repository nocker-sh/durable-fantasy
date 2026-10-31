import { outdoorSite } from "#/scripts/lib/outdoor-site"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getSiteDoorPose } from "#/scripts/lib/get-site-door-pose"
import type { Endpoint } from "#/scripts/lib/outdoor-access"

export function outdoorEntrance(endpoint: Endpoint, documents: ReadonlyMap<string, SettingDocument>, metres: number) {
  const owner = documents.get(endpoint.document)
  if (!owner) return undefined
  const site = outdoorSite(owner, endpoint, documents)
  if (!site) return undefined
  const room = site.room
  const map = site.map
  if (!room?.grid) return undefined
  const connection = (room.connections as { kind?: string; target: string; door?: number[]; width_cells?: number }[] | undefined)?.find(
    (c) => (c.kind ?? "door") !== "stair" && c.target === map && c.door?.[0] === endpoint.door[0] && c.door?.[1] === endpoint.door[1],
  )
  if (!connection) return undefined
  const pose = getSiteDoorPose({
    grid: room.grid,
    room_origin: room.origin as number[],
    door: endpoint.door,
    span: connection.width_cells ?? 1,
    site_origin: site.origin,
    width_m: site.width,
    depth_m: site.depth,
    rotation_quarters: site.rotation,
    metres_per_tile: metres,
  })
  if (
    !pose ||
    [0, 1].some((axis) => pose.point[axis] < pose.bounds[axis] - 1e-6 || pose.point[axis] > pose.bounds[axis + 2] + 1e-6) ||
    ![0, 1].some((axis) => Math.abs(pose.point[axis] - pose.bounds[axis]) < 1e-6 || Math.abs(pose.point[axis] - pose.bounds[axis + 2]) < 1e-6)
  )
    return undefined
  return { ...pose, id: owner.id, map }
}
