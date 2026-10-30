/** A half-open daily interval may cross midnight. */
export function within(min: number, from: number, to: number): boolean {
  return from <= to ? min >= from && min < to : min >= from || min < to
}
