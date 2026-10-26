/** Ordered boundaries on a repeating cycle. Callers supply time in the cycle's units. */
export class CyclicSchedule<T extends { from: number }> {
  private readonly entries: readonly T[]

  constructor(entries: readonly T[]) {
    this.entries = [...entries].sort((a, b) => a.from - b.from)
  }

  at(time: number): T | null {
    const entries = this.entries
    for (let i = 0; i < entries.length; i++) {
      const from = entries[i].from
      const to = entries[(i + 1) % entries.length].from
      if (from <= to ? time >= from && time < to : time >= from || time < to) return entries[i]
    }
    return entries[0] ?? null
  }
}
