// What a map room's message handler is given: the room, which map and channel it is, and the
// sender's presence on it.
import type { RoomContext } from "void/ws"
import type { RoomKey } from "#/world/channels"
import type { MapDefinition } from "#/world/maps/types"
import type { ClientMessage, ServerMessage } from "#/world/protocol"
import type { Presence } from "#/world/server/map-room/presence"

export type Ctx = {
  ctx: RoomContext<ServerMessage>
  key: RoomKey
  map: MapDefinition
  /** Server receipt time, before queued work and persistence waits. */
  receivedAt?: number
  me: Presence
  save(patch: Partial<Presence>): void
  /** someone sitting gets up before they walk off or strike */
  standUp(): Promise<boolean>
}

export type Message<K extends ClientMessage["type"]> = Extract<ClientMessage, { type: K }>
export type Handlers = { [K in ClientMessage["type"]]?: (c: Ctx, message: Message<K>) => Promise<void> }
