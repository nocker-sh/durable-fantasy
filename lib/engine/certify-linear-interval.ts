import type { Point3 } from "./cuboid-motion-types"
type Props = { from: Point3; to: Point3; canClear: (from: Point3, to: Point3) => boolean }
type Interval = { readonly from: Point3; readonly to: Point3 }
const MAX_DEPTH = 12

/** Accept only a complete sequence of certified intervals; a failed precision budget never drops a gap. */
export function certifyLinearInterval(props: Props): { intervals: readonly Interval[] } | Error {
  if (![...props.from, ...props.to].every(Number.isFinite)) return new Error("Invalid linear interval")
  const pending = [{ from: props.from, to: props.to, depth: 0 }],
    accepted: Interval[] = []
  while (pending.length) {
    const interval = pending.pop()
    if (!interval) return new Error("Missing linear interval")
    if (props.canClear(interval.from, interval.to)) {
      accepted.push({ from: [...interval.from], to: [...interval.to] })
      continue
    }
    if (interval.depth === MAX_DEPTH) return new Error("Continuous interval clearance remains unresolved", { cause: { from: [...interval.from], to: [...interval.to] } })
    const midpoint = [(interval.from[0] + interval.to[0]) / 2, (interval.from[1] + interval.to[1]) / 2, (interval.from[2] + interval.to[2]) / 2] satisfies [number, number, number]
    pending.push({ from: midpoint, to: interval.to, depth: interval.depth + 1 }, { from: interval.from, to: midpoint, depth: interval.depth + 1 })
  }

  return { intervals: accepted }
}
