import type { Disposable } from "#/lib/engine/cleanup-types"

export function isDisposable(value: unknown): value is Disposable {
  return value !== null && typeof value === "object" && "dispose" in value && typeof value.dispose === "function"
}
