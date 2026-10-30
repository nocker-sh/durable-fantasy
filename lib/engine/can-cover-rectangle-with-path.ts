import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import type { Rect } from "#/lib/engine/segment-distance-types"

type Props = Readonly<{ bounds: Rect; points: readonly (readonly [number, number])[]; radius: number }>

/** Certify the whole rectangle inside a path's segment capsules; corner checks alone cannot prove coverage by their union. Unresolved boundary cells fail closed. */
export function canCoverRectangleWithPath(props: Props): boolean {
  if (
    !props.bounds.every(Number.isFinite) ||
    props.bounds[0] > props.bounds[2] ||
    props.bounds[1] > props.bounds[3] ||
    !Number.isFinite(props.radius) ||
    props.radius < 0 ||
    props.points.length < 2 ||
    props.points.some((point) => !point.every(Number.isFinite))
  )
    throw new RangeError("Invalid path coverage")
  const segments = props.points.slice(1)
  const distance = (point: readonly [number, number], index: number) => segmentRectDistance([point[0], point[1], point[0], point[1]], props.points[index], segments[index])
  const covers = (rect: Rect, depth: number): boolean => {
    const corners: ReadonlyArray<readonly [number, number]> = [
      [rect[0], rect[1]],
      [rect[2], rect[1]],
      [rect[0], rect[3]],
      [rect[2], rect[3]],
    ]
    if (segments.some((_, index) => corners.every((point) => distance(point, index) <= props.radius + 1e-9))) return true
    const x = (rect[0] + rect[2]) / 2,
      z = (rect[1] + rect[3]) / 2
    const samples: ReadonlyArray<readonly [number, number]> = [...corners, [x, z]]
    if (depth === 0 || samples.some((point) => segments.every((_, index) => distance(point, index) > props.radius + 1e-9))) return false

    return [
      [rect[0], rect[1], x, z],
      [x, rect[1], rect[2], z],
      [rect[0], z, x, rect[3]],
      [x, z, rect[2], rect[3]],
    ].every((bounds) => covers([bounds[0], bounds[1], bounds[2], bounds[3]], depth - 1))
  }

  return covers(props.bounds, 12)
}
