/** experience a go at a recipe brings; half when it is spoiled */
export function craftExp(min: number): number {
  return 10 + 4 * min
}
