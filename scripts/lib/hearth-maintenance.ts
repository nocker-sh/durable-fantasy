import type { AshReceiving } from "#/scripts/lib/ash-receiving-schema"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
import type { HearthHandoff } from "#/world/town/hearth-handoff"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { hearthToolPaths } from "#/world/town/hearth-tool"
import { rectangleFace } from "#/lib/engine/rectangle-face"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import { MAX_HAND_REACH_M, MIN_OPERATING_SIDE_M } from "#/scripts/lib/spatial-rules"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"
import type { SettingDocument } from "#/scripts/lib/setting-document"
export type AshReceiver = {
  receiving: AshReceiving
  storage: { furniture: string; item: string }
  lid_rest: { box_support: "floor"; furniture: string; position_m: [number, number] }
  capacity_l: number
  cold_only: true
  status: "unverified"
  door_approach: { target: string; body_radius_m: number; carry_bottom_m: number; poses: { body_m: [number, number]; turn: 0 | 1 | 2 | 3 }[] }
}
export type HearthMaintenance = {
  ash_receiver?: AshReceiver
  work_pose_candidate?: WorkPoseCandidate
  handoff?: HearthHandoff
  carry?: { posture: "upright"; return: "reverse"; poses: { body_m: [number, number]; turn: 0 | 1 | 2 | 3 }[] }
  grip_height_m: number
  operator: string
  space_index: number
  body_m: [number, number]
  grip_m: [number, number]
  body_radius_m: number
  state: "cold_empty"
  tool: {
    name: string
    owner: string
    source: string
    maintainers: string[]
    length_m: number
    blade_width_m: number
    blade_thickness_m: number
    storage_status: "unverified"
    storage?: { furniture: string; item: string }
  }
}
export function auditHearthMaintenance(room: SettingDocument): string[] {
  const errors: string[] = [],
    k = room.grid?.cell_m
  if (!k) return errors
  for (const f of room.furniture ?? []) {
    const operation = f.hearth_maintenance
    if (!operation) {
      if (f.runtime_kind === "hearth" && room.design_gate === "通過") errors.push(`${f.symbol}: Hearth maintenance is missing`)
      continue
    }
    try {
      if (f.runtime_kind !== "hearth" || !f.hearth_front) throw new Error("Maintenance needs an authored hearth")
      const rSource = operation,
        nestedValue = rSource.body_m,
        x = nestedValue[0],
        z = nestedValue[1],
        r = rSource.body_radius_m,
        tool = rSource.tool
      if (
        ![x, z, r, tool.length_m, tool.blade_width_m, tool.blade_thickness_m].every(Number.isFinite) ||
        r < MIN_OPERATING_SIDE_M / 2 ||
        Math.min(tool.length_m, tool.blade_width_m, tool.blade_thickness_m) <= 0
      )
        throw new Error("Invalid hearth maintenance dimensions")
      if (room.design_gate === "通過" && tool.storage_status === "unverified") throw new Error("Hearth maintenance tool storage is unverified")
      if (operation.state !== "cold_empty") throw new Error("Hearth maintenance requires a cold empty firebox")
      const space = f.use_space?.[operation.space_index]?.rect
      if (!space || x - r < space[0] * k - 1e-9 || x + r > (space[0] + space[2]) * k + 1e-9 || z - r < space[1] * k - 1e-9 || z + r > (space[1] + space[3]) * k + 1e-9)
        throw new Error("Maintenance body leaves its operating space")
      for (const other of room.furniture ?? []) {
        const oxState = other.rect,
          ox = oxState[0],
          oz = oxState[1],
          w = oxState[2],
          d = oxState[3]
        if (pointRectDistance(x, z, [ox * k, oz * k, (ox + w) * k, (oz + d) * k]) + 1e-9 < r) throw new Error("Maintenance body intersects furniture")
      }
      const fxState = f.rect,
        fx = fxState[0],
        fz = fxState[1],
        fw = fxState[2],
        fd = fxState[3],
        spec = hearthDimensions(f.hearth)
      const face = rectangleFace({ x: (fx + fw / 2) * k, z: (fz + fd / 2) * k, width: fw * k, depth: fd * k, side: f.hearth_front })
      if ((x - face.point[0]) * face.outward[0] + (z - face.point[1]) * face.outward[1] < r) throw new Error("Maintenance body is not in front of the hearth")
      if (tool.blade_width_m >= spec.openingWidth || tool.blade_thickness_m >= spec.openingTop - spec.openingBottom) throw new Error("Maintenance tool does not fit the firebox opening")
      if (operation.tool.storage) {
        const location = operation.tool.storage,
          rack = room.furniture?.find((piece) => piece.symbol === location.furniture)
        const shelf = rack?.shelf !== undefined ? shelfDimensions(rack.shelf, rack.rect[2] * k, rack.rect[3] * k) : undefined
        const item = shelf?.items?.find((item) => item.id === location.item)
        if (
          !item ||
          item.kind !== "tool" ||
          Math.abs(item.height - operation.tool.length_m) > 1e-9 ||
          Math.abs(item.width - operation.tool.blade_width_m) > 1e-9 ||
          Math.abs(item.depth - operation.tool.blade_thickness_m) > 1e-9
        )
          throw new Error("Maintenance tool does not match its stored object")
      }
      const grip = operation.grip_m
      if (!grip || !grip.every(Number.isFinite) || Math.hypot(grip[0] - x, grip[1] - z) > MAX_HAND_REACH_M + 1e-9) throw new Error("Maintenance grip is beyond hand reach")
      if (grip[0] < space[0] * k || grip[0] > (space[0] + space[2]) * k || grip[1] < space[1] * k || grip[1] > (space[1] + space[3]) * k) throw new Error("Maintenance grip leaves its operating space")
      hearthToolPaths({
        bounds: { x0: fx * k, z0: fz * k, x1: (fx + fw) * k, z1: (fz + fd) * k },
        front: f.hearth_front,
        spec: spec,
        grip: grip,
        bladeWidth: tool.blade_width_m,
        length: tool.length_m,
      })
      const spatial = hearthSpatialStrokes({
        bounds: { x0: fx * k, z0: fz * k, x1: (fx + fw) * k, z1: (fz + fd) * k },
        front: f.hearth_front,
        spec: spec,
        grip: grip,
        height: operation.grip_height_m,
        width: tool.blade_width_m,
        thickness: tool.blade_thickness_m,
        length: tool.length_m,
      })
      for (const stroke of spatial.strokes) if (Math.hypot(stroke.grip[0] - x, stroke.grip[2] - z) > MAX_HAND_REACH_M + 1e-9) throw new Error("Spatial working grip is beyond planar hand reach")
      for (const other of room.furniture ?? []) {
        if (other === f) continue
        const oxState2 = other.rect,
          ox = oxState2[0],
          oz = oxState2[1],
          w = oxState2[2],
          d = oxState2[3],
          rect = [ox * k, oz * k, (ox + w) * k, (oz + d) * k] as const
        if (
          spatial.strokes.some((inputProps) => {
            const b = inputProps.bounds
            return b.x0 < rect[2] - 1e-9 && b.x1 > rect[0] + 1e-9 && b.z0 < rect[3] - 1e-9 && b.z1 > rect[1] + 1e-9
          })
        )
          throw new Error("Maintenance tool path intersects furniture")
      }
    } catch (error) {
      errors.push(`${f.symbol}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return errors
}
