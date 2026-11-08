import type { DragEvent } from "react"
import { ITEM_DRAG } from "#/components/hud/drag"

export const carriesItem = (event: DragEvent) => event.dataTransfer.types.includes(ITEM_DRAG)
