import type { GridSweepInput as Props, GridSweepWindow, GridSweepWindowFailure } from "./grid-sweep-types"

/** 実際に走査する格子の全範囲を先に検証し、上限を超える照会で地形へ触れない。 */
export function getSweptGridWindow(props: Props): GridSweepWindow | GridSweepWindowFailure {
  if (
    !Number.isFinite(props.from[0]) ||
    !Number.isFinite(props.from[1]) ||
    !Number.isFinite(props.to[0]) ||
    !Number.isFinite(props.to[1]) ||
    !Number.isFinite(props.radius) ||
    !Number.isFinite(props.cellSize) ||
    props.radius <= 0 ||
    props.cellSize <= 0
  )
    return "Invalid moving footprint"

  const x0 = Math.floor((Math.min(props.from[0], props.to[0]) - props.radius) / props.cellSize)
  const z0 = Math.floor((Math.min(props.from[1], props.to[1]) - props.radius) / props.cellSize)
  const x1 = Math.floor((Math.max(props.from[0], props.to[0]) + props.radius) / props.cellSize)
  const z1 = Math.floor((Math.max(props.from[1], props.to[1]) + props.radius) / props.cellSize)
  const width = x1 - x0 + 1
  const depth = z1 - z0 + 1
  const count = width * depth
  if (!Number.isSafeInteger(x0) || !Number.isSafeInteger(z0) || !Number.isSafeInteger(x1) || !Number.isSafeInteger(z1) || count > 65536) return "Moving footprint exceeds traversal budget"

  return { x0, z0, width, depth, count }
}
