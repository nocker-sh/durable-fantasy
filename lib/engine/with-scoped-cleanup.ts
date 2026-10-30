import type { CleanupOutcome } from "#/lib/engine/cleanup-types"

/** 処理の成否によらず片付け、両方が失敗した理由も保持する。 */
export async function withScopedCleanup<T>(run: () => T | Promise<T>, cleanup: () => void | Promise<void>): Promise<T> {
  const outcome = await Promise.resolve()
    .then(run)
    .then<CleanupOutcome<T>, CleanupOutcome<T>>(
      (value) => ({ isSuccess: true, value }),
      (error: unknown) => ({ isSuccess: false, error }),
    )
  try {
    await cleanup()
  } catch (cleanupError) {
    if (!outcome.isSuccess) throw new AggregateError([outcome.error, cleanupError], "Operation and cleanup failed")
    throw cleanupError
  }
  if (!outcome.isSuccess) throw outcome.error
  return outcome.value
}
