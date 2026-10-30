import { CleanupStack } from "./cleanup-stack"
export async function withCleanup<T>(build: (resources: CleanupStack) => Promise<T>): Promise<T> {
  const resources = new CleanupStack()
  try {
    return await build(resources)
  } catch (error) {
    try {
      resources.dispose()
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Construction and cleanup failed")
    }
    throw error
  }
}
