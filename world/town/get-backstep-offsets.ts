import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = { phase: number; stride: number; lift: number; pelvisDrop: number; settlingDrop: number; leading: "l" | "r"; clearance: Readonly<Record<"l" | "r", number>> }

/** Step the leading foot back, then collect the other foot; body-relative offsets cancel translation at each planted foot. */
export function getBackstepOffsets(props: Props): { body: number; pelvisDrop: number; l: Point3; r: Point3 } | Error {
  if (
    ![props.phase, props.stride, props.lift, props.pelvisDrop, props.settlingDrop, props.clearance.l, props.clearance.r].every(Number.isFinite) ||
    props.phase < 0 ||
    props.phase > 1 ||
    props.stride <= 0 ||
    props.lift <= 0 ||
    Math.min(props.pelvisDrop, props.settlingDrop, props.clearance.l, props.clearance.r) < 0 ||
    (props.leading !== "l" && props.leading !== "r")
  )
    return new Error("Invalid backward step dimensions")
  const trailing = props.leading === "l" ? "r" : "l"
  if (props.clearance[trailing] > 1e-9) return new Error("Backward step has no initially planted support foot")

  const foot = (side: "l" | "r"): Point3 => {
    const progress = side === props.leading ? Math.min(1, props.phase * 2) : Math.max(0, props.phase * 2 - 1),
      collected = progress * progress * (3 - 2 * progress)
    return [0, -props.clearance[side] * collected + 16 * progress ** 2 * (1 - progress) ** 2 * props.lift, (props.phase - collected) * props.stride]
  }
  const settling = props.phase * props.phase * (3 - 2 * props.phase),
    dip = 16 * props.phase ** 2 * (1 - props.phase) ** 2

  return { body: -props.phase * props.stride, pelvisDrop: props.pelvisDrop * dip + props.settlingDrop * settling, l: foot("l"), r: foot("r") }
}
