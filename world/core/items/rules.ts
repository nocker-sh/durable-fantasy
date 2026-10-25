import { type ItemId, ITEMS } from "./catalog.ts";
import type { Slot } from "./kinds.ts";

export function isItemId(value: string): value is ItemId {
  return Object.hasOwn(ITEMS, value);
}

/** What a shop pays for an item: half the price, at least 1. Key items cannot be sold. */
export function sellPrice(id: ItemId): number {
  return Math.max(1, Math.floor(ITEMS[id].price / 2));
}

export function sellable(id: ItemId): boolean {
  return ITEMS[id].kind !== "key";
}

/** The slots an item can go in. */
export function slotsFor(id: ItemId): readonly Slot[] {
  const part = ITEMS[id].equip?.part;
  if (!part) return [];
  return part === "accessory" ? ["accessory1", "accessory2"] : [part];
}
