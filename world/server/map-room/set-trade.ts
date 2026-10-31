import type { WebSocketConnection } from "void/ws"
import type { ServerMessage } from "#/world/protocol"
import type { Presence, TradeSide } from "#/world/server/map-room/presence"
import { presence } from "#/world/server/map-room/presence"

export const setTrade = (connection: Pick<WebSocketConnection<ServerMessage>, "state" | "setState">, trade: TradeSide | undefined, patch: Partial<Presence> = {}) =>
  connection.setState({ ...presence(connection), ...patch, trade } satisfies Presence)
