/** 上向きの二つの三角形を各セルへ並べ、行の端を次の行のセルへつながない。 */
export function createGridIndices(side: number): number[] {
  if (!Number.isSafeInteger(side) || side < 2) throw new RangeError("A grid needs at least two vertices per side")
  const indices: number[] = []
  for (const row = { value: 0 }; row.value < side - 1; row.value++) {
    for (const column = { value: 0 }; column.value < side - 1; column.value++) {
      const a = row.value * side + column.value
      const b = a + 1
      const c = a + side
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  return indices
}
