/** Scene construction mutates shared layout and registries, so only one build may run at a time. */
export class SceneBuildQueue {
  private tail: Promise<unknown> = Promise.resolve()

  run<T extends { dispose(): void }>(create: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    const result = this.tail.then(async () => {
      signal?.throwIfAborted()
      const runtime = await create()
      if (signal?.aborted) {
        runtime.dispose()
        signal.throwIfAborted()
      }
      return runtime
    })
    this.tail = result.catch(() => {})
    return result
  }
}
