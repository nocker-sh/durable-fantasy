import { DIV } from "#/world/town/floorplan/geometry"

/** Split [a, b] into `n` parts with thin partitions between them; returns the parts. */
export function split(a: number, b: number, n: number): [number, number][] {
  const step = (b - a - DIV * (n - 1)) / n
  return Array.from({ length: n }, (_, k) => [a + k * (step + DIV), a + k * (step + DIV) + step])
}
