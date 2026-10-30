import type { Q } from "#/lib/engine/quaternion-types"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"

// Cross-section rings joined by straight sides (a loft, like folded-paper townspeople in
// a faceted silhouette). Each ring is an ellipse w x d in its bone's frame.
export type Ring = { c: V3; q: Q; w: number; d: number }
