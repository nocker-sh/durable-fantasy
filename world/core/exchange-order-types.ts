import type { Reason } from "#/world/core/commands"
import type { OrderIntent } from "#/world/core/exchange-types"
import type { Transition } from "#/world/core/transition"
export type OrderJob = { id: number; connection: string; seq: number; name: string; intent: OrderIntent } & ({ phase: "pending" | "done" } | { phase: "refused"; reason: Reason })
export type OrderRequests = {
  serial: number
  jobs: Record<string, OrderJob>
}
export type OrderEscrow = {
  id: number
  intent: OrderIntent
  by?: string
}
export type HeldOrder = Extract<Transition, { ok: false }> | (Extract<Transition, { ok: true }> & { receipt: OrderEscrow })
