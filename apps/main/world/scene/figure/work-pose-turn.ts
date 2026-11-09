import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"

export const workPoseTurn = (facing: WorkPoseCandidate["facing"]): 0 | 1 | 2 | 3 => (facing === "s" ? 0 : facing === "w" ? 1 : facing === "n" ? 2 : 3)
