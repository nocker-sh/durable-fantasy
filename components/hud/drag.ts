// Dragging an item from the bag (or an equipment slot) onto another slot or the shortcut bar.
import type { DragEvent } from "react";
import type { ItemId, Slot } from "#/world/core/items.ts";
import type { SkillId } from "#/world/core/skills.ts";

export const ITEM_DRAG = "application/x-ui-item";

/** What is dragged: an item from a bag slot or something worn, or a skill (onto the shortcut bar). */
export type DragSource = { item: ItemId; slot: number } | { item: ItemId; worn: Slot } | { skill: SkillId };

export function startDrag(event: DragEvent, source: DragSource, icon: string) {
  event.dataTransfer.setData(ITEM_DRAG, JSON.stringify(source));
  event.dataTransfer.effectAllowed = "move";
  const image = new Image();
  image.src = icon;
  event.dataTransfer.setDragImage(image, 16, 16);
}

export function readDrag(event: DragEvent): DragSource | null {
  try {
    return JSON.parse(event.dataTransfer.getData(ITEM_DRAG));
  } catch {
    return null;
  }
}

export const carriesItem = (event: DragEvent) => event.dataTransfer.types.includes(ITEM_DRAG);
