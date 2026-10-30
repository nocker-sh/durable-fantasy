import type { Rect } from "#/lib/engine/segment-distance-types"

type Props = Readonly<{ rect: Rect; from: ReadonlyArray<number>; to: ReadonlyArray<number>; boundary?: "open" | "closed" }>

/** 開いた境界では接するだけの線分を除き、線分を両軸の範囲へ切り詰める。 */
export function segmentIntersectsRect(props: Props): boolean {
  const interval = { near: 0, far: 1 }
  const boundary = props.boundary ?? "closed"
  for (const axis of [0, 1] as const) {
    const start = props.from[axis],
      direction = props.to[axis] - start
    const low = props.rect[axis],
      high = props.rect[axis + 2]
    if (direction === 0) {
      if (start < low || start > high || (boundary === "open" && (start === low || start === high))) return false
      continue
    }
    const entry = (low - start) / direction,
      exit = (high - start) / direction
    interval.near = Math.max(interval.near, Math.min(entry, exit))
    interval.far = Math.min(interval.far, Math.max(entry, exit))
  }
  if (boundary === "open") return interval.near < interval.far
  return interval.near <= interval.far
}
