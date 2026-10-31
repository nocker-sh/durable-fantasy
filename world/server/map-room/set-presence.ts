import type { WebSocketConnection } from "void/ws"
import type { ServerMessage } from "#/world/protocol"
import type { Presence } from "#/world/server/map-room/presence"
import { presence } from "#/world/server/map-room/presence"

export const setPresence = (connection: Pick<WebSocketConnection<ServerMessage>, "state" | "setState">, patch: Partial<Presence>) =>
  connection.setState({ ...presence(connection), ...patch } satisfies Presence)
