import type { WildState } from "#/world/core/wild/types"
import type { Reason } from "#/world/core/commands"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import type { CombatPlan } from "#/world/server/combat-plan"
import type { SkillId } from "#/world/core/skill-types"

export type StrikeResult = {
  revision?: number
  hp: number
  beaten: boolean
  back: number
  refused: boolean
  reason?: Reason
}

export type StrikeIntent = {
  id: number
  request: string
  target: string
  damage: number
  owner: string
  art?: SkillId
  at: number
  plan?: CombatPlan
}

export type StrikeJob = StrikeIntent & ({ phase: "pending" } | { phase: "done"; result: StrikeResult; deliveries?: { owner: string; delivery: CombatDelivery }[] })

export type WildRecord = {
  revision: number
  wild: WildState
  serial: number
  jobs: Record<string, StrikeJob>
  deliverySerial: number
  deliveries: Record<string, CombatDelivery[]>
}

export const wildMigrations = [
  { version: 1, migrate: (saved: unknown): WildRecord => ({ revision: 0, ...(saved as { wild: WildState }), serial: 0, jobs: {}, deliverySerial: 0, deliveries: {} }) },
  { version: 2, migrate: (saved: unknown): WildRecord => ({ ...(saved as WildRecord), revision: 0, deliverySerial: 0, deliveries: {} }) },
  { version: 3, migrate: (saved: unknown): WildRecord => ({ ...(saved as WildRecord), revision: 0 }) },
]
