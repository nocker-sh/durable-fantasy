/** A failed optional cache must not hold up the work that can recreate its contents.
 * Stop using this access path after an error or timeout for the instance's lifetime.
 */
export class OptionalCacheAccess {
  private available = true
  constructor(private readonly timeoutMs: number) {}

  run<T>(operation: () => Promise<T>, fallback: T, releaseLate?: (value: T) => void): Promise<T> {
    if (!this.available) return Promise.resolve(fallback)
    return new Promise((resolve) => {
      let settled = false
      const finish = (value: T, failed = false) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (failed) this.available = false
        resolve(value)
      }
      const timer = setTimeout(() => finish(fallback, true), this.timeoutMs)
      void Promise.resolve()
        .then(operation)
        .then(
          (value) => {
            if (settled) releaseLate?.(value)
            else finish(value)
          },
          () => finish(fallback, true),
        )
    })
  }
}
