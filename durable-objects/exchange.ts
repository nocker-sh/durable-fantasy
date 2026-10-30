// One exchange for all towns. Void persists each operation; the server coordinator sequences RPCs.
import { defineDurableState } from "void/durable"
import { Player } from "#/durable-objects/player"
import type { OrderIntent } from "#/world/core/exchange-types"
import { initialExchangeRecord, exchangeMigrations } from "#/world/server/exchange-record"
import { beginExchangeOrder } from "#/world/server/begin-exchange-order"
import { advanceExchangeOrder } from "#/world/server/advance-exchange-order"
import { cancelExchangeOrder } from "#/world/server/cancel-exchange-order"
import { reserveExchangeInbox } from "#/world/server/reserve-exchange-inbox"
import { deliverExchangeInbox } from "#/world/server/deliver-exchange-inbox"
import { viewExchange } from "#/world/server/view-exchange"
import { recoverExchange } from "#/world/server/recover-exchange"
import type { ExchangePlayer } from "#/world/server/exchange-coordinator"

const players = (owner: string): ExchangePlayer => Player.get(owner)

export const Exchange = defineDurableState({
  initialState: initialExchangeRecord,
  version: 2,
  migrations: exchangeMigrations,
  methods: {
    beginOrder(context, input: { owner: string; connection: string; seq: number; name: string; intent: OrderIntent }) {
      const owner = input.owner
      const connection = input.connection
      const seq = input.seq
      const name = input.name
      const intent = input.intent

      return beginExchangeOrder({ context: context, players: players, owner: owner, connection: connection, seq: seq, name: name, intent: intent })
    },
    place(context, owner: string, id: number) {
      return advanceExchangeOrder({ context: context, players: players, owner: owner, id: id })
    },
    cancel(context, owner: string, id: string) {
      return cancelExchangeOrder(context, owner, id)
    },
    reserveInbox(context, owner: string) {
      return reserveExchangeInbox(context, owner)
    },
    deliverInbox(context, owner: string, id: number) {
      return deliverExchangeInbox({ context: context, players: players, owner: owner, id: id })
    },
    look(context, symbol: string, owner: string) {
      return viewExchange(context, symbol, owner)
    },
  },
  alarm(context) {
    return recoverExchange(context, players)
  },
})

export default Exchange
