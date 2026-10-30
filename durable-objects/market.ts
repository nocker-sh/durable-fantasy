// Shared shop stock and durable sale/purchase reservations (economy.md §4).
import { defineDurableState } from "void/durable"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopId } from "#/world/core/shop-types"
import type { ShopCommand } from "#/world/core/shop-receipt-types"
import { initialMarketRecord } from "#/world/server/initial-market-record"
import { marketMigrations } from "#/world/server/market-migrations"
import { shopOffers } from "#/world/server/shop-offers"
import { shopBuying } from "#/world/server/shop-buying"
import { beginShopTrade } from "#/world/server/begin-shop-trade"
import { finishShopTrade } from "#/world/server/finish-shop-trade"
import { recoverShopTrades } from "#/world/server/recover-shop-trades"
import { Player } from "#/durable-objects/player"

const players = (owner: string) => Player.get(owner)
export const Market = defineDurableState({
  initialState: initialMarketRecord,
  version: 1,
  migrations: marketMigrations,
  methods: {
    look(context, shop: ShopId, toClose: number | null) {
      return shopOffers(context.state, shop, toClose)
    },
    buying(context, shop: ShopId, items: ItemId[]) {
      return shopBuying(context.state, shop, items)
    },
    beginTrade(context, input: { owner: string; connection: string; seq: number; command: ShopCommand; keepers: string[]; toClose: number | null }) {
      const owner = input.owner
      const connection = input.connection
      const seq = input.seq
      const command = input.command
      const keepers = input.keepers
      const toClose = input.toClose

      return beginShopTrade({ context: context, players: players, owner: owner, connection: connection, seq: seq, command: command, keepers: keepers, toClose: toClose })
    },
    finishTrade(context, owner: string, id: number) {
      return finishShopTrade({ context: context, players: players, owner: owner, id: id })
    },
  },
  alarm(context) {
    return recoverShopTrades(context, players)
  },
})
export type { Offer } from "../world/server/market-stock"
export default Market
