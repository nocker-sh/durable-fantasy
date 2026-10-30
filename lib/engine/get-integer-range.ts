/** Materialize a bounded half-open interval in ascending order; reversed intervals are empty. */
export function getIntegerRange(start: number, end: number): readonly number[] {
  const length = Math.max(0, end - start)
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || !Number.isSafeInteger(length)) throw new RangeError("Integer range requires safe integer bounds")
  return Array.from({ length }, (_, index) => start + index)
}
