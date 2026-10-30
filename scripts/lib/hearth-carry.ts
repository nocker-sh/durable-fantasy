import { certifyStorageCarry } from "../../world/town/storage-carry"
import { roomCarryObstacles } from "#/scripts/lib/room-carry-obstacles"
import { MIN_PASSAGE_WIDTH_M, MIN_STANDING_HEADROOM_M } from "./spatial-rules"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"
import { storageRetrieval } from "../../world/town/storage-retrieval"
import { shelfDimensions } from "./shelf-dimensions"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const EPS = 1e-9
const near = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS
export function auditHearthCarry(room: SettingDocument, building?: SettingDocument): string[] {
  if (!room.grid) return []
  const errors: string[] = [],
    k = room.grid.cell_m
  for (const f of room.furniture ?? []) {
    const op = f.hearth_maintenance,
      carry = op?.carry
    if (!op || !carry) continue
    try {
      const boxes = roomCarryObstacles(room)
      if (carry.return !== "reverse" || carry.posture !== "upright") throw new Error("Carry needs a reversible upright route")
      const storage = op.tool.storage,
        rack = room.furniture?.find((p) => p.symbol === storage?.furniture)
      if (!rack || !storage) throw new Error("Carry has no tool storage")
      const xState = rack.rect.map((v) => v * k),
        x = xState[0],
        z = xState[1],
        w = xState[2],
        d = xState[3],
        shelf = shelfDimensions(rack.shelf, w, d),
        index = shelf.items?.findIndex((i) => i.id === storage.item) ?? -1
      const motion = storageRetrieval({ x: x + w / 2, z: z + d / 2, width: w, depth: d, shelf: shelf, index: index }),
        body = motion.bodyEnd,
        t = motion.to
      const relative = [t.x0 - body[0], t.z0 - body[1], t.x1 - body[0], t.z1 - body[1]] as const,
        r = op.body_radius_m
      if (!Number.isFinite(r) || r < MIN_PASSAGE_WIDTH_M / 2) throw new Error("Carry omits the carrier design width")
      if (pointRectDistance(0, 0, relative) < r - EPS) throw new Error("Carried tool intersects its carrier")
      const level = (building?.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[] | undefined)?.find((l) => l.floor === room.floor)
      const clearance = level ? level.ceiling_elevation_m - level.elevation_m : NaN
      if (!Number.isFinite(clearance) || t.y1 > clearance + EPS) throw new Error("Carried tool lacks ceiling clearance")
      if (clearance < MIN_STANDING_HEADROOM_M) throw new Error("Carry lacks standing headroom")
      const poses = carry.poses
      if (poses.length < 2 || !near(poses[0].body_m, body) || poses[0].turn !== 0 || !near(poses.at(-1)!.body_m, op.handoff?.staging_body_m ?? op.body_m))
        throw new Error("Carry does not join storage withdrawal to hearth maintenance")
      certifyStorageCarry({ relative: relative, radius: r, poses: poses, width: room.grid.rows[0].length * k, depth: room.grid.rows.length * k, obstacles: boxes, name: "tool" })
    } catch (error) {
      errors.push(`${f.symbol}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return errors
}
