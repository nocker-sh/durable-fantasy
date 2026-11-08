import { newPlayer } from "#/world/core/new-player"
import type { PlayerRecord } from "#/world/server/player-record"

export const initialPlayerRecord = (): PlayerRecord => ({
  player: newPlayer(),
  credential: null,
  location: null,
  trade: null,
  tradeJob: null,
  exchangeReceipt: null,
  orderEscrow: null,
  combatPayments: {},
  combatReceipts: {},
  deliveryRevision: 0,
  shopReceipts: {},
  gatherReceipts: {},
  combatLife: 0,
})
