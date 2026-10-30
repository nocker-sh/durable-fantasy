import type { GatherReceipt } from "#/world/core/gather-receipt-types"
import type { ShopReceipt } from "#/world/core/shop-receipt-types"
import type { PlayerLocation } from "#/world/core/location-types"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import type { OrderEscrow } from "#/world/core/exchange-order-types"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import type { CombatPayment } from "#/world/core/combat-payment"
import type { TradeParticipant } from "#/world/server/trade-coordinator"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"

export type PlayerRecord = TradeParticipant & {
  credential: string | null
  location: PlayerLocation | null
  exchangeReceipt: InboxClaim | null
  orderEscrow: OrderEscrow | null
  combatPayments: Record<string, CombatPayment>
  combatReceipts: Record<string, CombatDelivery>
  deliveryRevision: number
  shopReceipts: Record<string, ShopReceipt>
  gatherReceipts: Record<string, GatherReceipt>
  combatLife: number
}

export type MigrationFields = Partial<PlayerRecord> & { combatRevision?: number }

function migrate(saved: unknown, additions: MigrationFields): PlayerRecord & { combatRevision?: number } {
  if (!saved || typeof saved !== "object" || !("player" in saved)) throw new Error("Saved player record is unreadable")
  // Void saves migrations before running a method. Reject bad payloads before that save too.
  restoreSavedPlayer(saved.player)
  const record = saved as Pick<PlayerRecord, "player" | "credential" | "location"> & MigrationFields
  return {
    ...record,
    trade: record.trade ?? null,
    tradeJob: record.tradeJob ?? null,
    exchangeReceipt: record.exchangeReceipt ?? null,
    orderEscrow: record.orderEscrow ?? null,
    combatPayments: record.combatPayments ?? {},
    combatReceipts: record.combatReceipts ?? {},
    deliveryRevision: record.deliveryRevision ?? record.combatRevision ?? 0,
    shopReceipts: record.shopReceipts ?? {},
    gatherReceipts: record.gatherReceipts ?? {},
    combatLife: record.combatLife ?? 0,
    ...additions,
  }
}

export const playerMigrations = [
  {
    version: 1,
    migrate: (saved: unknown) => migrate(saved, { trade: null, tradeJob: null, exchangeReceipt: null, orderEscrow: null, combatPayments: {}, combatReceipts: {}, combatRevision: 0, combatLife: 0 }),
  },
  { version: 2, migrate: (saved: unknown) => migrate(saved, { tradeJob: null, exchangeReceipt: null, orderEscrow: null, combatPayments: {}, combatReceipts: {}, combatRevision: 0, combatLife: 0 }) },
  { version: 3, migrate: (saved: unknown) => migrate(saved, { exchangeReceipt: null, orderEscrow: null, combatPayments: {}, combatReceipts: {}, combatRevision: 0, combatLife: 0 }) },
  { version: 4, migrate: (saved: unknown) => migrate(saved, { orderEscrow: null, combatPayments: {}, combatReceipts: {}, combatRevision: 0, combatLife: 0 }) },
  { version: 5, migrate: (saved: unknown) => migrate(saved, { combatPayments: {}, combatReceipts: {}, combatRevision: 0, combatLife: 0 }) },
  { version: 6, migrate: (saved: unknown) => migrate(saved, { combatReceipts: {}, combatRevision: 0, combatLife: 0 }) },
  {
    version: 7,
    migrate: (saved: unknown): PlayerRecord => {
      const record = { ...migrate(saved, { shopReceipts: {} }) }
      delete record.combatRevision
      return record
    },
  },
  { version: 8, migrate: (saved: unknown) => migrate(saved, { gatherReceipts: {} }) },
]
