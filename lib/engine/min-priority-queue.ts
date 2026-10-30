/** Own the mutable search heap without exposing its storage; equal priorities retain the existing binary-heap tie order. */
export class MinPriorityQueue<T> {
  readonly #entries: { priority: number; value: T }[] = []

  constructor() {
    Object.freeze(this)
  }

  get size(): number {
    return this.#entries.length
  }

  push(priority: number, value: T): void {
    if (!Number.isFinite(priority)) throw new RangeError("Queue priority must be finite")

    this.#entries.push({ priority, value })
    this.#rise(this.#entries.length - 1)
  }

  pop(): T | null {
    const first = this.#entries[0]
    const last = this.#entries.pop()
    if (!first || !last) return null
    if (this.#entries.length) {
      this.#entries[0] = last
      this.#sink(0)
    }
    return first.value
  }

  #rise(index: number): void {
    if (index === 0) return

    const parent = (index - 1) >> 1
    if (this.#entries[parent].priority <= this.#entries[index].priority) return

    const entry = this.#entries[index]
    this.#entries[index] = this.#entries[parent]
    this.#entries[parent] = entry
    this.#rise(parent)
  }

  #sink(index: number): void {
    const left = index * 2 + 1
    const right = left + 1
    const smaller = left < this.size && this.#entries[left].priority < this.#entries[index].priority ? left : index
    const next = right < this.size && this.#entries[right].priority < this.#entries[smaller].priority ? right : smaller
    if (next === index) return

    const entry = this.#entries[index]
    this.#entries[index] = this.#entries[next]
    this.#entries[next] = entry
    this.#sink(next)
  }
}
