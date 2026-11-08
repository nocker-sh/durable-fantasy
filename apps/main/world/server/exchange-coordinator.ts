import type { OrderIntent } from "#/world/core/exchange-types"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"
import type { ExchangeRecord } from "#/world/server/exchange-record"

export type ExchangeContext = {
  state: ExchangeRecord
  setAlarm(at: number): Promise<void>
}

export type ExchangePlayer = {
  ownsConnection(connection: string): Promise<boolean>
  holdOrder(id: number, intent: OrderIntent): Promise<Transition & { by?: string }>
  read(): Promise<PlayerState>
  receiveInbox(claim: InboxClaim): Promise<Transition>
  inboxReceipt(id: number): Promise<Transition | null>
}

export type ExchangePlayers = (owner: string) => ExchangePlayer

export const RECOVERY_BATCH = 20

export const RETRY_MS = 5000
