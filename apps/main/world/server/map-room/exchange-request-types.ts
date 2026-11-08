import type { Exchange } from "#/durable-objects/exchange"
import type { Player } from "#/durable-objects/player"
import type { Ctx } from "#/world/server/map-room/context"

export type ExchangeRequestContext = Readonly<{
  connection: Pick<Ctx["ctx"]["connection"], "id" | "send">
  owner: string
  name: string
  exchange: Pick<ReturnType<typeof Exchange.get>, "beginOrder" | "place" | "cancel" | "reserveInbox" | "deliverInbox" | "look">
  player: Pick<ReturnType<typeof Player.get>, "read">
}>
