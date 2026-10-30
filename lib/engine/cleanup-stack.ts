import type { Disposable } from "#/lib/engine/cleanup-types"

/** Own resources as they are acquired, including resources created before an async failure. */
export class CleanupStack {
  private callbacks: (() => void)[] = []
  private closed = false
  private released = new WeakSet<Disposable>()

  defer(cleanup: () => void): void {
    if (this.closed) cleanup()
    else this.callbacks.push(cleanup)
  }

  use<T extends Disposable>(resource: T): T {
    this.defer(() => this.release(resource))
    return resource
  }

  release(resource: Disposable): void {
    if (this.released.has(resource)) return
    this.released.add(resource)
    resource.dispose()
  }

  dispose(): void {
    if (this.closed) return
    this.closed = true
    const errors: unknown[] = [],
      callbacks = this.callbacks.splice(0).reverse()
    for (const cleanup of callbacks)
      try {
        cleanup()
      } catch (error) {
        errors.push(error)
      }
    if (errors.length) throw new AggregateError(errors, "Resource cleanup failed")
  }
}
