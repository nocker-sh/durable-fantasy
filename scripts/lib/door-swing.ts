import type { DoorFittings } from "#/world/town/door-section"
import type { PairedDoorSequence } from "#/scripts/lib/audit-paired-door-operation"
import type { DoorOperation } from "#/scripts/lib/door-operation"

export type Leaf = {
  fittings?: DoorFittings
  vertical_clearance_m?: { bottom: number; top: number }
  wall_depth_cells?: number
  door: number[]
  hinge: "start" | "end"
  paired?: boolean
  meeting_gap_m?: number
  paired_sequence?: PairedDoorSequence
  waits_for: { furniture: string; space_index: number }[]
  operation?: DoorOperation
  frame_inset_m?: number
  thickness_m?: number
}

export type DoorSwing = { handle_along_m?: number; hinge: number[]; radius: number; bounds: [number, number, number, number]; open_tip: number[]; thickness_m?: number }
