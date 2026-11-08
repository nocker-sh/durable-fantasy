import type { DragEvent } from "react"
import { ITEM_DRAG, dragSourceSchema } from "#/components/hud/drag"
import type { DragSource } from "#/components/hud/drag"

export function readDrag(event: DragEvent): DragSource | null {
  try {
    const parsed = dragSourceSchema.safeParse(JSON.parse(event.dataTransfer.getData(ITEM_DRAG)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
