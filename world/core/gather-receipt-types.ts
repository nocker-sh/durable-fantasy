import type { Reason } from "#/world/core/commands"

export type GatherRequest = { id: number; node: string; roll: number }
export type GatherReceipt = { request: GatherRequest; outcome: { ok: true } | { ok: false; reason: Reason } }
