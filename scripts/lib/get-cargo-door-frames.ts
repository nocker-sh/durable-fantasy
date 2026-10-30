import { z } from "zod"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"
import { getDoorFrameBoxes } from "#/scripts/lib/get-door-frame-boxes"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const connectionsSchema = z.array(
  z.object({
    kind: z.enum(["door", "opening", "stair"]).optional(),
    door: z.tuple([z.number().int().nonnegative().safe(), z.number().int().nonnegative().safe()]).optional(),
    width_cells: z.number().int().positive().safe().default(1),
  }),
)

/** Cargo paths retain the jambs throughout the wall depth, rather than treating every D cell as empty floor. */
export function getCargoDoorFrames(room: SettingDocument): ReadonlyArray<readonly [number, number, number, number]> | Error {
  const grid = room.grid,
    connections = connectionsSchema.safeParse(room.connections ?? []),
    leaves = z.array(doorLeafGeometrySchema).safeParse(room.door_leaves ?? [])
  if (!grid || !connections.success || !leaves.success) return new Error("Cargo route has invalid doorway geometry")
  const frames: (readonly [number, number, number, number])[] = []
  for (const connection of connections.data) {
    if (connection.kind !== undefined && connection.kind !== "door") continue
    const door = connection.door
    if (!door) return new Error("Cargo route has no doorway coordinate")
    const leaf = leaves.data.find((leaf) => leaf.door[0] === door[0] && leaf.door[1] === door[1])
    if (!leaf) return new Error("Cargo route has an undesigned door leaf")
    if (leaf.frame_inset_m === undefined) return new Error("Cargo route needs the door frame inset")
    const boxes = getDoorFrameBoxes({
      door,
      width: connection.width_cells,
      cellM: grid.cell_m,
      rows: grid.rows.length,
      columns: grid.rows[0]?.length ?? 0,
      frameInset: leaf.frame_inset_m,
      wallDepth: leaf.wall_depth_cells ?? 1,
    })
    if (boxes instanceof Error) return boxes
    frames.push(...boxes)
  }

  return frames
}
