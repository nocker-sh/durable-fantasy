import type { FigurePaint, FigurePalette, FigureShape } from "#/world/core/monster-figure-types"

/**
 * A block laid along a bone of the rig: a box from the joint `bone` to the joint `to`, `width` across and
 * `height` up, lengthened by `grow` at both ends. It turns with `bone` as the clips play.
 */
export type RigSpan = { bone: string; to: string; width: number; height: number; paint: FigurePaint; grow?: number }

/** A block fixed to a bone where it stands in the rest pose: `at` and `turn` as in the rest pose, y = 0 the ground, +z the face. */
export type RigPiece = { bone: string; shape: FigureShape; size: readonly [number, number, number]; at: readonly [number, number, number]; turn?: readonly [number, number, number]; paint: FigurePaint }

export type RigBlock = RigSpan | RigPiece

/**
 * A block creature moved by a rig and its clips from `public/models/monsters/<id>/` (model, walk and idle).
 * Only the bones and clips are used; the model's own skin is not drawn.
 */
export type MonsterModel = {
  id: "spider" | "snake" | "trex"
  /** how long the rig is along `axis` in its rest pose, in tiles, before the kind's `size` */
  length: number
  axis: "x" | "y" | "z"
  /** how far it reaches from its centre on the ground in any pose, in tiles before `size` */
  reach: number
  palette: FigurePalette
  blocks: readonly RigBlock[]
}
