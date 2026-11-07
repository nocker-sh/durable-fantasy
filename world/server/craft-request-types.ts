import type { Transition } from "#/world/core/transition"

export type CraftRequest = Readonly<{ connection: string; seq: number; recipe: string; station: string; roll: number }>
export type CraftReceipt = Readonly<{
  request: Omit<CraftRequest, "roll">
  outcome: { ok: true } | Extract<Transition, { ok: false }>
}>
