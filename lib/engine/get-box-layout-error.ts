export type LayoutBox = { id: string; origin: readonly [number, number, number]; size: readonly [number, number, number] }
type Props = { size: readonly [number, number, number]; boxes: readonly LayoutBox[]; gap: number }

/** Check solid outer bounds; nesting hollow objects and their physical support require separate models. */
export function getBoxLayoutError(props: Props): Error | null {
  if (props.size.some((value) => !Number.isFinite(value) || value <= 0) || !Number.isFinite(props.gap) || props.gap < 0) return new Error("Invalid box layout dimensions")
  const ids = new Set<string>()

  for (const box of props.boxes) {
    if (!box.id.trim() || ids.has(box.id)) return new Error("Duplicate or missing layout object ID")
    ids.add(box.id)
    if (box.size.some((value) => !Number.isFinite(value) || value <= 0) || box.origin.some((value) => !Number.isFinite(value) || value < 0)) return new Error(`Invalid layout object ${box.id}`)
    if (box.origin.some((value, axis) => !Number.isFinite(value + box.size[axis]) || value + box.size[axis] <= value || value + box.size[axis] > props.size[axis] * (1 + Number.EPSILON * 4)))
      return new Error(`Layout object ${box.id} leaves its container`)
  }
  for (const first of props.boxes.keys())
    for (const second of props.boxes.keys()) {
      if (second <= first) continue
      const a = props.boxes[first],
        b = props.boxes[second]
      if (
        ![0, 1, 2].some(
          (axis) =>
            Math.max(b.origin[axis] - (a.origin[axis] + a.size[axis]), a.origin[axis] - (b.origin[axis] + b.size[axis])) >=
            props.gap - Number.EPSILON * Math.max(a.origin[axis] + a.size[axis], b.origin[axis] + b.size[axis], props.gap) * 4,
        )
      )
        return new Error(`Layout objects ${a.id} and ${b.id} overlap or lack clearance`)
    }

  return null
}
