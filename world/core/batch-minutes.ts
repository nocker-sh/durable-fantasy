/** Batch definitions use minutes after midnight, independent of the day they are produced. */
export function batchMinutes(hour: number, minute = 0): number {
  return hour * 60 + minute
}
