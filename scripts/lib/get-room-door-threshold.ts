import { z } from "zod"
import { getDoorFrameBoxes } from "#/scripts/lib/get-door-frame-boxes"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"
import { roomDoorPortalSchema } from "#/scripts/lib/building-door-inventory-schema"
import { getBuildingDoorPortals } from "#/scripts/lib/get-building-door-portals"
import { getRoomDoorThresholdPoint } from "#/scripts/lib/get-room-door-threshold-point"
import { roomDoorSwings } from "#/scripts/lib/room-door-swings"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; door: readonly [number, number]; documents: ReadonlyMap<string, SettingDocument> }>

/** Resolve the actual owner on either side before measuring the framed aperture with open fitted panels. */
export function getRoomDoorThreshold(props: Props) {
  const parsed = roomDoorPortalSchema.safeParse(props.room),
    building = props.documents.get(String(props.room.building))
  if (!parsed.success || !building) return new Error("Open passage has no authored room or building")
  const portals = getBuildingDoorPortals({ building, documents: props.documents })
  if (portals instanceof Error) return portals
  const portal = portals.find((portal) => portal.room === props.room.id && portal.door[0] === props.door[0] && portal.door[1] === props.door[1]),
    owners = portals.filter((candidate) => candidate.key === portal?.key && candidate.leafCount === 1)
  if (!portal || owners.length !== 1) return new Error("Open passage has no unique physical door owner")
  const owner = props.documents.get(owners[0].room),
    ownerRoom = roomDoorPortalSchema.safeParse(owner),
    leaves = z.array(doorLeafGeometrySchema).safeParse(owner?.door_leaves)
  if (!owner || !ownerRoom.success || !leaves.success || ownerRoom.data.grid.cell_m !== parsed.data.grid.cell_m) return new Error("Open passage owner has no matching panel geometry")
  const leaf = leaves.data.find((leaf) => leaf.door[0] === owners[0].door[0] && leaf.door[1] === owners[0].door[1])
  if (!leaf) return new Error("Open passage has no fitted panel")
  const swings = roomDoorSwings(owner, leaf)
  if (!swings.length || leaf.frame_inset_m === undefined || leaf.thickness_m === undefined || !leaf.fittings) return new Error("Open passage has no complete fitted aperture")
  const clearWidth = swings[0].radius * swings.length + (leaf.paired ? (leaf.meeting_gap_m ?? 0) : 0) - (swings[0].thickness_m ?? 0) * swings.length
  const localFrames = getDoorFrameBoxes({
    door: leaf.door,
    width: owners[0].width,
    cellM: parsed.data.grid.cell_m,
    rows: ownerRoom.data.grid.rows.length,
    columns: ownerRoom.data.grid.rows[0].length,
    frameInset: leaf.frame_inset_m,
    wallDepth: leaf.wall_depth_cells ?? 1,
  })
  if (localFrames instanceof Error) return localFrames
  const dx = (ownerRoom.data.origin[0] - parsed.data.origin[0]) * parsed.data.grid.cell_m,
    dy = (ownerRoom.data.origin[1] - parsed.data.origin[1]) * parsed.data.grid.cell_m
  const frames = localFrames.map((box) => [box[0] + dx, box[1] + dy, box[2] + dx, box[3] + dy] satisfies readonly [number, number, number, number])

  return { point: getRoomDoorThresholdPoint({ door: props.door, width: portal.width, cellM: parsed.data.grid.cell_m, rows: parsed.data.grid.rows.length }), clearWidth, frames }
}
