import { roomDoorSwing } from "#/scripts/lib/room-door-swing"
import { getSiteDoorPose } from "#/scripts/lib/get-site-door-pose"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import { auditDoorPushMotion } from "#/scripts/lib/audit-door-push-motion"
import { closingTransfer } from "#/scripts/lib/closing-transfer"
import { auditDoorPushFloor } from "#/scripts/lib/audit-door-push-floor"
import type { PushLeaf } from "#/scripts/lib/door-push"

export function auditDoorPushes(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const room of documents.values())
    for (const leaf of (room.door_leaves ?? []) as PushLeaf[]) {
      if (!leaf.push_operation) continue
      const fail = (message: string) => errors.push(`${room.id}: ${message}`)
      const building = documents.get(String(room.building))
      const steps = ((building?.entry_steps ?? []) as EntrySteps[]).find((steps) => steps.room === room.id && steps.door[0] === leaf.door[0] && steps.door[1] === leaf.door[1])
      const swing = roomDoorSwing(room, leaf)
      if (
        room.kind !== "rooms" ||
        room.floor !== 0 ||
        !room.grid ||
        building?.kind !== "buildings" ||
        !building.foundation ||
        !((building.rooms ?? []) as string[]).includes(room.id) ||
        !steps ||
        !swing ||
        leaf.paired ||
        !leaf.thickness_m ||
        leaf.frame_inset_m === undefined
      ) {
        fail("push has no single exterior panel and designed landing")
        continue
      }
      const connection = ((room.connections ?? []) as { door?: number[]; width_cells?: number; target: string }[]).find(
        (connection) => connection.target === building.map && connection.door?.[0] === leaf.door[0] && connection.door[1] === leaf.door[1],
      )
      if (!connection) {
        fail("push has no exterior doorway")
        continue
      }
      const pose = getSiteDoorPose({
        grid: room.grid,
        room_origin: [0, 0],
        door: leaf.door,
        span: connection.width_cells ?? 1,
        site_origin: [0, 0],
        width_m: room.grid.rows[0].length * room.grid.cell_m,
        depth_m: room.grid.rows.length * room.grid.cell_m,
        rotation_quarters: 0,
        metres_per_tile: 1,
      })
      if (!pose) {
        fail("push has no valid exterior doorway")
        continue
      }
      const end = pose.point.map((value, i) => value + pose.outward[i] * steps.landing_depth_m)
      const dx = (Math.abs(pose.outward[1]) * steps.clear_width_m) / 2,
        dz = (Math.abs(pose.outward[0]) * steps.clear_width_m) / 2
      const landing = [Math.min(pose.point[0], end[0]) - dx, Math.min(pose.point[1], end[1]) - dz, Math.max(pose.point[0], end[0]) + dx, Math.max(pose.point[1], end[1]) + dz] as const
      for (const problem of [...auditDoorPushMotion(swing, leaf.push_operation), ...auditDoorPushFloor({ room: room, swing: swing, push: leaf.push_operation, landing: landing })]) fail(problem)
      if (!leaf.operation) fail("push has no indoor closing operation")
      else {
        const transferSource = closingTransfer(swing, leaf.push_operation, leaf.operation),
          transfer = transferSource.transfer,
          errors = transferSource.errors
        for (const problem of [...errors, ...auditDoorPushFloor({ room: room, swing: swing, push: transfer, landing: landing })]) fail(problem)
      }
    }
  return errors
}
