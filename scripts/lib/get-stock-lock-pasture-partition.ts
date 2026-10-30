type Rect = readonly [number, number, number, number]
type Point = readonly [number, number]
type Props = Readonly<{ pasture: Rect; enclosure: Rect; operationFloor: Rect }>

/** Replace the northwest grazing corner with the vestibule; the inner fence is shared rather than built twice. */
export function getStockLockPasturePartition(props: Props) {
  const pasture = props.pasture,
    enclosure = props.enclosure,
    floor = props.operationFloor
  if (![...pasture, ...enclosure, ...floor].every(Number.isFinite) || pasture[0] >= pasture[2] || pasture[1] >= pasture[3] || enclosure[0] >= enclosure[2] || enclosure[1] >= enclosure[3])
    return new Error("Invalid stock lock pasture partition")
  if (Math.abs(enclosure[1] - pasture[1]) > 1e-9 || enclosure[0] >= pasture[0] || enclosure[2] <= pasture[0] || enclosure[2] >= pasture[2] || enclosure[3] >= pasture[3])
    return new Error("Stock lock does not partition the northwest pasture corner")
  if (Math.abs(floor[0] - enclosure[2]) > 1e-9 || floor[1] < pasture[1] - 1e-9 || floor[2] > pasture[2] + 1e-9 || floor[3] > pasture[3] + 1e-9 || floor[0] >= floor[2] || floor[1] >= floor[3])
    return new Error("Stock lock operating floor is detached or leaves the retained pasture")
  const stockBoundary: ReadonlyArray<Point> = [
    [enclosure[2], pasture[1]],
    [pasture[2], pasture[1]],
    [pasture[2], pasture[3]],
    [pasture[0], pasture[3]],
    [pasture[0], enclosure[3]],
    [enclosure[2], enclosure[3]],
    [enclosure[2], pasture[1]],
  ]
  const outsideBoundary: ReadonlyArray<Point> = [
    [enclosure[2], pasture[1]],
    [enclosure[0], pasture[1]],
    [enclosure[0], enclosure[3]],
    [pasture[0], enclosure[3]],
  ]
  const grazingLoss: Rect = [pasture[0], pasture[1], enclosure[2], enclosure[3]]

  return { stockBoundary, outsideBoundary, grazingLoss }
}
