import { acquireSpriteBakeLock } from "./acquire-sprite-bake-lock"
import { withScopedCleanup } from "#/lib/engine/with-scoped-cleanup"

export async function withSpriteBakeLock<T>(directory: string, work: (token: string) => Promise<T>): Promise<T> {
  const lease = acquireSpriteBakeLock(directory)
  return withScopedCleanup(() => work(lease.token), lease.release)
}
