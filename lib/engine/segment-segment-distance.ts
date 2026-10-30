import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"

type Props = Readonly<{ from: ReadonlyArray<number>; to: ReadonlyArray<number>; otherFrom: ReadonlyArray<number>; otherTo: ReadonlyArray<number> }>

/** 両線分の途中で交差する場合も含めて最短距離を求める。 */
export function segmentSegmentDistance(props: Props): number {
  const dx = props.to[0] - props.from[0],
    dz = props.to[1] - props.from[1]
  const ex = props.otherTo[0] - props.otherFrom[0],
    ez = props.otherTo[1] - props.otherFrom[1]
  const determinant = dx * ez - dz * ex
  if (determinant !== 0) {
    const cx = props.otherFrom[0] - props.from[0],
      cz = props.otherFrom[1] - props.from[1]
    const t = (cx * ez - cz * ex) / determinant,
      u = (cx * dz - cz * dx) / determinant
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 0
  }
  return Math.min(
    segmentRectDistance([props.from[0], props.from[1], props.from[0], props.from[1]], props.otherFrom, props.otherTo),
    segmentRectDistance([props.to[0], props.to[1], props.to[0], props.to[1]], props.otherFrom, props.otherTo),
    segmentRectDistance([props.otherFrom[0], props.otherFrom[1], props.otherFrom[0], props.otherFrom[1]], props.from, props.to),
    segmentRectDistance([props.otherTo[0], props.otherTo[1], props.otherTo[0], props.otherTo[1]], props.from, props.to),
  )
}
