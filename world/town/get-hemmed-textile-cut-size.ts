type Props = Readonly<{ finished: readonly [number, number]; edgeAllowance: number }>

/** Add the total cloth consumed at each edge without shrinking the finished field. This is a cutting plane, not a thickness or stitching model. */
export function getHemmedTextileCutSize(props: Props): readonly [number, number] | Error {
  if (!props.finished.every((value) => Number.isFinite(value) && value > 0) || !Number.isFinite(props.edgeAllowance) || props.edgeAllowance <= 0) return new Error("Invalid hemmed textile dimensions")
  const size: readonly [number, number] = [props.finished[0] + 2 * props.edgeAllowance, props.finished[1] + 2 * props.edgeAllowance]
  if (!size.every(Number.isFinite) || size[0] <= props.finished[0] || size[1] <= props.finished[1]) return new Error("Unbounded or lost textile edge allowance")

  return size
}
