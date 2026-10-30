type Props = Readonly<{ stride: number; lift: number }>

/** Both horizontal derivatives are nonnegative, so their difference is at most 3 strides; the lifted quartic's exact half-cycle maximum is 32√3/9 lift heights. */
export function getEasedSideStepSpeedBound(props: Props) {
  if (![props.stride, props.lift].every((value) => Number.isFinite(value) && value > 0)) return new Error("Invalid eased side-step dimensions")
  const body = 1.5 * props.stride,
    foot = Math.hypot(3 * props.stride, ((32 * Math.sqrt(3)) / 9) * props.lift)
  if (![body, foot].every(Number.isFinite)) return new Error("Unbounded eased side-step speed")

  return { body: body * (1 + 1e-12) + 1e-12, foot: foot * (1 + 1e-12) + 1e-12 }
}
