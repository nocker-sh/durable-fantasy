import type { DragEvent } from "react"
import { ITEM_DRAG } from "#/components/hud/drag"
import type { DragSource } from "#/components/hud/drag"

export function startDrag(event: DragEvent, source: DragSource, icon: string) {
  event.dataTransfer.setData(ITEM_DRAG, JSON.stringify(source))
  event.dataTransfer.effectAllowed = "move"
  const image = new Image()
  image.src = icon
  event.dataTransfer.setDragImage(image, 16, 16)
}
