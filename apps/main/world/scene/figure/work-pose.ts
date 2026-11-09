import type { KneelingConstraint } from "#/world/scene/figure/kneeling"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"

export type WorkPoseCandidate = {
  off_hand?: { palm_m: V3; pole: V3 }
  kneeling?: KneelingConstraint
  shoe_contacts?: ("shoe_l" | "shoe_r")[]
  stroke_motion?: "fixed_support"
  stroke_clearance?: "unverified"
  animation: "scrub"
  frame: number
  body_m: [number, number]
  facing: "n" | "s" | "e" | "w"
  hand: "l" | "r"
  pole: V3
}
