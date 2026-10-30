import { getGridSegmentCoverage } from "./get-grid-segment-coverage"
type Props = Parameters<typeof getGridSegmentCoverage>[0]

/** Preserve the throwing cell-list contract while coverage consumers may handle bounded rejection explicitly. */
export function getGridSegmentCells(props: Props): ReadonlyArray<readonly [number, number]> {
  const cells = getGridSegmentCoverage(props)
  if (cells instanceof Error) throw cells

  return cells
}
