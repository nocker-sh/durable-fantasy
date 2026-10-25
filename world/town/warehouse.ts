// When the warehouse is open: while Hilde is at her counter (routines.ts), not at the well or asleep.
import { STORAGE_KEEPER } from "../core/storage.ts"
import { slotAt } from "./routines.ts"

export const storageOpen = (min: number) => slotAt(STORAGE_KEEPER, min)?.where === "work"
