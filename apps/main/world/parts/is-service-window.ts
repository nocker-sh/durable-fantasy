import { SERVICE_WINDOWS } from "#/world/state"
import type { ServiceWindowId, WindowId } from "#/world/state"

/** A window that opens with a person or a place, as against one the player opens and closes (ui.md §5). */
export function isServiceWindow(id: WindowId | ServiceWindowId): id is ServiceWindowId {
  return (SERVICE_WINDOWS as readonly string[]).includes(id)
}
