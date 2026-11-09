const B = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

export function bayer(x: number, y: number): number {
  return B[y & 3][x & 3] / 16 - 0.47
}
