import { withScopedCleanup } from "#/lib/engine/with-scoped-cleanup"

/** Scene construction mutates shared layout and registries, so only one build may run at a time. */
export class SceneBuildQueue {
  private readonly state = { tail: Promise.resolve<unknown>(undefined) }

  constructor() {
    Object.freeze(this)
  }

  run<T extends { dispose(): void | Promise<void> }>(create: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    const pending = this.state.tail.then(async () => {
      signal?.throwIfAborted()
      const runtime = await create()
      if (signal?.aborted)
        return withScopedCleanup(
          () => {
            signal.throwIfAborted()
            return runtime
          },
          () => runtime.dispose(),
        )
      return runtime
    })
    this.state.tail = pending.catch(() => {})
    return pending
  }
}
