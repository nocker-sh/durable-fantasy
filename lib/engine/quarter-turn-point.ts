export function quarterTurnPoint(x: number, z: number, turn: 0 | 1 | 2 | 3): readonly [number, number] {
  return turn === 0 ? [x, z] : turn === 1 ? [-z, x] : turn === 2 ? [-x, -z] : [z, -x]
}
