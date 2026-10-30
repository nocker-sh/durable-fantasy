import type { DoorOperation } from "#/scripts/lib/door-operation"

export type PushPose = { angle_deg: number; body_m: [number, number] }

export type DoorPush = { body_radius_m: number; poses: PushPose[] }

export type PushLeaf = {
  door: number[]
  hinge: "start" | "end"
  waits_for: { furniture: string; space_index: number }[]
  paired?: boolean
  thickness_m?: number
  frame_inset_m?: number
  operation?: DoorOperation
  push_operation?: DoorPush
}
