export function getExchangeDay(at: number): string {
  return new Date(at + 9 * 3_600_000).toISOString().slice(0, 10)
}
