/** Pick the nearest cell centre strictly inside the wall, including half-cell boundaries. */
export function getInteriorDoorCoordinate(point: number, normal: number): number {
  const at = point * 2 - 0.5
  return normal > 0 ? Math.ceil(at) - 1 : normal < 0 ? Math.floor(at) + 1 : Math.floor(point * 2)
}
