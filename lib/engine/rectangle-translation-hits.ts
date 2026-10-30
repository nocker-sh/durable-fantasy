import { segmentIntersectsRect } from "./segment-intersects-rect"
import type { Rect } from "./rectangle-motion-types"
type Props = Readonly<{ relative: Rect; from: readonly number[]; to: readonly number[]; obstacle: Rect; tolerance?: number; boundary?: "open" | "closed" }>

/** Exact continuous collision, including diagonal motion; tolerance and edge policy belong to the caller. */
export function rectangleTranslationHits(props: Props): boolean {
  const tolerance = props.tolerance ?? 0
  const expanded: Rect = [
    props.obstacle[0] - props.relative[2] + tolerance,
    props.obstacle[1] - props.relative[3] + tolerance,
    props.obstacle[2] - props.relative[0] - tolerance,
    props.obstacle[3] - props.relative[1] - tolerance,
  ]
  if (expanded[0] > expanded[2] || expanded[1] > expanded[3]) return false
  return segmentIntersectsRect({ rect: expanded, from: props.from, to: props.to, boundary: props.boundary ?? "closed" })
}
