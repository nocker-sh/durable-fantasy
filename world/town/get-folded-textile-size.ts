type Props = Readonly<{ size: readonly [number, number, number]; folds: readonly [number, number]; allowance: readonly [number, number, number] }>

/** Nominal layers retain the original thickness; authored outer allowances are proposals, not a cloth-deformation certificate. */
export function getFoldedTextileSize(props: Props): readonly [number, number, number] | Error {
  if (
    !props.size.every((value) => Number.isFinite(value) && value > 0) ||
    !props.allowance.every((value) => Number.isFinite(value) && value >= 0) ||
    !props.folds.every((value) => Number.isSafeInteger(value) && value > 0)
  )
    return new Error("Invalid folded textile dimensions")
  const layers = props.folds[0] * props.folds[1]
  if (!Number.isSafeInteger(layers)) return new Error("Unbounded folded textile layers")
  const folded: readonly [number, number, number] = [props.size[0] / props.folds[0], props.size[1] * layers, props.size[2] / props.folds[1]]
  if (!folded.every((value) => Number.isFinite(value) && value > 0)) return new Error("Unbounded or lost folded textile dimensions")

  const size: readonly [number, number, number] = [folded[0] + props.allowance[0], folded[1] + props.allowance[1], folded[2] + props.allowance[2]]
  if (props.allowance.some((value, axis) => value > 0 && size[axis] <= folded[axis])) return new Error("Lost folded textile allowance")
  if (!size.every((value) => Number.isFinite(value) && value > 0)) return new Error("Unbounded folded textile size")

  return size
}
