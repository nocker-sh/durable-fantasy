/** Runs work in arrival order per key without blocking unrelated keys. */
export class KeyedQueue {
  private readonly tails = new Map<string, Promise<void>>()

  run<T>(key: string, work: () => Promise<T>): Promise<T> {
    const result = (this.tails.get(key) ?? Promise.resolve()).then(work)
    const tail = result.then(
      () => {},
      () => {},
    )
    this.tails.set(key, tail)
    void tail.then(() => {
      if (this.tails.get(key) === tail) this.tails.delete(key)
    })
    return result
  }
}
