import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Readonly<{ root: Point3; target: Point3; radius: number; upper: number; lower: number; pole: Point3 }>

/** Enclose every target in a ball strictly inside the reach annulus and away from the solver's pole fallback; no sampled endpoints substitute for this domain. */
export function getTwoBoneBallRange(props: Props) {
  if (![...props.root, ...props.target, ...props.pole, props.radius, props.upper, props.lower].every(Number.isFinite) || props.radius < 0 || props.upper <= 0 || props.lower <= 0)
    return new Error("Invalid two-bone target ball")
  const d: Point3 = [props.target[0] - props.root[0], props.target[1] - props.root[1], props.target[2] - props.root[2]],
    p: Point3 = [props.pole[0] - props.root[0], props.pole[1] - props.root[1], props.pole[2] - props.root[2]]
  const distance = Math.hypot(...d),
    poleLength = Math.hypot(...p),
    extent = props.radius + 1e-12 * (1 + distance + poleLength + props.upper + props.lower + props.radius)
  const minimum = distance - extent,
    maximum = distance + extent
  if (![minimum, maximum].every(Number.isFinite) || minimum <= Math.abs(props.upper - props.lower) || maximum >= props.upper + props.lower)
    return new Error("Two-bone target ball leaves regular reach")
  const cross = Math.hypot(p[1] * d[2] - p[2] * d[1], p[2] * d[0] - p[0] * d[2], p[0] * d[1] - p[1] * d[0]),
    bendMinimum = (cross - poleLength * extent) / maximum
  if (!Number.isFinite(bendMinimum) || bendMinimum <= 1e-12) return new Error("Two-bone target ball reaches a singular pole")
  const c = props.upper ** 2 - props.lower ** 2,
    along = (value: number) => (value * value + c) / (2 * value)
  const alongMaximum = Math.max(Math.abs(along(minimum)), Math.abs(along(maximum))),
    heightMinimum = Math.sqrt(Math.max(0, props.upper ** 2 - alongMaximum ** 2))
  if (![alongMaximum, heightMinimum].every(Number.isFinite) || heightMinimum <= 0) return new Error("Two-bone target ball reaches a straight joint")

  return { minimum, maximum, poleLength, bendMinimum, alongMaximum, heightMinimum }
}
