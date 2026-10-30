// When the warehouse is open: while Hilde is at her counter (routines.ts), not at the well or asleep.
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { slotAt } from "#/world/town/slot-at"

export const storageOpen = (min: number) => slotAt(STORAGE_KEEPER, min)?.where === "work"
