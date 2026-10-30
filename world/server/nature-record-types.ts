import type { NatureState } from "#/world/core/nature/types"
import type { GatherRequest } from "#/world/core/gather-receipt-types"

export type GatherJob = { connection: string; seq: number; request: GatherRequest; phase: "pending" | "done" }
export type NatureRecord = { nature: NatureState; serial: number; jobs: Record<string, GatherJob> }
