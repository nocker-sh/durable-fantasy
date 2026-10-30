import type { Rect } from "./rectangle-motion-types"
/** Bounds of a fixed-orientation rectangle translating between two reference points. */
export function rectangleTranslationBounds(relative: Rect, a: readonly number[], b: readonly number[]): Rect {
  return [Math.min(a[0], b[0]) + relative[0], Math.min(a[1], b[1]) + relative[1], Math.max(a[0], b[0]) + relative[2], Math.max(a[1], b[1]) + relative[3]]
}
