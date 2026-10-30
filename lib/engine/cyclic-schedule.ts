/** Ordered boundaries on a repeating cycle. Callers supply time in the cycle's units. */
export class CyclicSchedule<T extends { from: number }> {
  private readonly entries: readonly T[]

  constructor(entries: readonly T[]) {
    if (entries.some((entry) => !Number.isFinite(entry.from)) || new Set(entries.map((entry) => entry.from)).size !== entries.length)
      throw new RangeError("Schedule boundaries must be finite and distinct")

    this.entries = [...entries].sort((a, b) => a.from - b.from)
  }

  at(time: number): T | null {
    if (!Number.isFinite(time)) throw new RangeError("Schedule time must be finite")

    const entries = this.entries
    return entries.find((entry, index) => time >= entry.from && (index === entries.length - 1 || time < entries[index + 1].from)) ?? entries.at(-1) ?? null
  }
}
