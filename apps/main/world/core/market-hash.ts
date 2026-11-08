/** Shelf batches and hourly demand share the same deterministic numeric seed. */
export function marketHash(...numbers: number[]): number {
  const hash = numbers.reduce((previous, value) => Math.imul(previous ^ (Math.floor(value) & 0xffffffff), 16777619), 2166136261)

  return ((hash >>> 0) % 100_000) / 100_000
}
