import type { DoorOperation } from "#/scripts/lib/door-operation"
import type { DoorSwing } from "#/scripts/lib/door-swing"
type Point = readonly [number, number]

/** Logical actions occur at their physical phase, not when the caretaker is still standing at the region anchor. */
export type StockLockMotionPhase =
  | Readonly<{ kind: "walk"; pose: "open" | "closed"; points: ReadonlyArray<Point> }>
  | Readonly<{ kind: "unlatch" | "latch" | "observation"; event_index: number; point: Point }>
  | Readonly<{ kind: "push"; event_index: number; poses: ReadonlyArray<Readonly<{ angle_deg: number; body_world_m: Point }>> }>
  | Readonly<{ kind: "pull"; event_index: number; direction: "open" | "close"; swing: DoorSwing; operation: DoorOperation & Readonly<{ body_angle_mode: "clamp_leaf_angle" }>; from: Point; to: Point }>
