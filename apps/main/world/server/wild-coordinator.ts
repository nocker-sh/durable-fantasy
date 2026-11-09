import type { Swing } from "#/world/core/combat-types"
import type { SkillId } from "#/world/core/skill-types"
import type { Transition } from "#/world/core/transition"
import type { Party } from "#/world/core/party/types"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import type { CombatReader } from "#/world/server/combat-plan"
import type { WildRecord, StrikeResult as SavedStrikeResult } from "#/world/server/wild-record"

export type StrikeResult = SavedStrikeResult & { payment?: Transition; counter?: Swing }

export type WildContext = {
  state: WildRecord
  id: { toString(): string }
  setAlarm(at: number): Promise<void>
}

export type StrikePlayer = CombatReader & {
  receiveCombat(source: string, delivery: CombatDelivery): Promise<Transition>
  payStrike(input: { source: string; id: number; art?: SkillId; life?: number }): Promise<Transition>
}

export type CombatParties = (party: string) => { view(): Promise<Party> }

export type CombatNotice = { owner: string; result: Transition }

export const RETRY_MS = 5000

export const BATCH = 20
