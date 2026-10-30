import type { Bounds } from "#/lib/engine/bounds-types"
import { isFiniteOrderedBounds } from "#/lib/engine/is-finite-ordered-bounds"

type Props = Readonly<{ moving: Bounds; fixed: Bounds; margin: number }>

/** 全方向の余地を加えても囲いが離れる場合だけ、詳細形状の照合を省ける。 */
export function areExpandedBoundsSeparated(props: Props): boolean {
  if (!Number.isFinite(props.margin) || props.margin < 0) return false

  const moving = props.moving
  const fixed = props.fixed
  const margin = props.margin
  if (!isFiniteOrderedBounds(moving) || !isFiniteOrderedBounds(fixed)) return false

  return (
    moving.max[0] + margin < fixed.min[0] ||
    moving.min[0] - margin > fixed.max[0] ||
    moving.max[1] + margin < fixed.min[1] ||
    moving.min[1] - margin > fixed.max[1] ||
    moving.max[2] + margin < fixed.min[2] ||
    moving.min[2] - margin > fixed.max[2]
  )
}
