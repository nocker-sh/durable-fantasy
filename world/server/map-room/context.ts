// What a map room's message handler is given: the room, which map and channel it is, and the
// sender's presence on it.
import type { RoomContext } from "void/ws"
import type { RoomKey } from "../../channels.ts"
import type { MapDefinition } from "../../maps/index.ts"
import type { ClientMessage, ServerMessage } from "../../protocol.ts"
import type { Presence } from "./presence.ts"

export interface Ctx {
  ctx: RoomContext<ServerMessage>
  key: RoomKey
  map: MapDefinition
  /** Server receipt time, before queued work and persistence waits. */
  receivedAt?: number
  me: Presence
  save(patch: Partial<Presence>): void
  /** someone sitting gets up before they walk off or strike */
  standUp(): Promise<void>
}

export type Message<K extends ClientMessage["type"]> = Extract<ClientMessage, { type: K }>
export type Handlers = { [K in ClientMessage["type"]]?: (c: Ctx, message: Message<K>) => Promise<void> }
