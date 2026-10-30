/** Ordered boundaries on a repeating cycle. Boundaries are captured once; returned entries retain the caller's identity. */
export class CyclicSchedule<T extends { from: number }> {
  readonly #boundaries: ReadonlyArray<Readonly<{ from: number; entry: T }>>

  constructor(entries: readonly T[]) {
    if (entries.some((entry) => !Number.isFinite(entry.from)) || new Set(entries.map((entry) => entry.from)).size !== entries.length)
      throw new RangeError("Schedule boundaries must be finite and distinct")

    this.#boundaries = Object.freeze(entries.map((entry) => Object.freeze({ from: entry.from, entry })).sort((a, b) => a.from - b.from))
    Object.freeze(this)
  }

  at(time: number): T | null {
    if (!Number.isFinite(time)) throw new RangeError("Schedule time must be finite")

    const boundaries = this.#boundaries
    return (boundaries.find((boundary, index) => time >= boundary.from && (index === boundaries.length - 1 || time < boundaries[index + 1].from)) ?? boundaries.at(-1))?.entry ?? null
  }
}
