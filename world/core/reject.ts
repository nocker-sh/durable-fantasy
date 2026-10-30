import type { Reason } from "#/world/core/commands"
import type { Transition } from "#/world/core/transition"

export function reject(reason: Reason): Transition {
  return { ok: false, reason }
}
