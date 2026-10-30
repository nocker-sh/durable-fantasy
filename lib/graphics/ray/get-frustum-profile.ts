type Props = { radiusFrom: number; radiusTo: number; compression: number; shellThickness: number | null; length: number }

/** Radius and thickness share the undeformed circular profile; compression changes only its transverse metric. */
export function getFrustumProfile(props: Props) {
  if (![props.radiusFrom, props.radiusTo, props.compression, props.length].every((value) => Number.isFinite(value) && value > 0) || props.compression > 1) return new Error("Invalid frustum profile")
  if (props.shellThickness !== null && (!Number.isFinite(props.shellThickness) || props.shellThickness <= 0 || props.shellThickness * 2 >= Math.min(props.radiusFrom, props.radiusTo)))
    return new Error("Invalid frustum shell thickness")
  const slope = (props.radiusTo - props.radiusFrom) / props.length,
    lipschitz = Math.hypot(1, slope * props.compression)
  if (!Number.isFinite(lipschitz)) return new Error("Unbounded frustum gradient")

  return { slope, lipschitz }
}
