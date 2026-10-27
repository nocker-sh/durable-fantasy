import { createGameState } from "./initial-state.ts"
import type { ServerMessageContext } from "./server-context.ts"
import type { VoidSocket } from "void/ws"
import type { Transition } from "../core/apply.ts"
import type { Cell } from "../protocol.ts"
import type { MapScene } from "../scene/index.ts"
import { Others } from "../parts/others.ts"
import { Rooms } from "../parts/rooms.ts"

/** State owned by one live game session, shared by its client controllers. */
export class GameSession {
  readonly state = createGameState()
  socket: VoidSocket<"/map/:mapId"> | null = null
  playerId = ""
  partyChat = { party: "", seq: 0 }
  readonly others = new Others()
  waiting = new Map<number, (result: Transition) => void>()
  arriveAt: Cell | null = null
  warpAskedAt = 0
  wild: Parameters<MapScene["setWild"]>[0] = {}
  engaged: string | null = null
  warping = false
  fighting: { monster: string; at: number } | null = null
  refusedWarp = -1
  warpAgainAt = 0
  readonly rooms = new Rooms()
  wantChannel: number | null = null
  fullTries = 0
  net = { messages: 0, bytes: 0, since: performance.now() }
}
type SessionCallbacks = Omit<ServerMessageContext, "session">

export function createSessionContext(session: GameSession, callbacks: SessionCallbacks): ServerMessageContext {
  return { session, ...callbacks }
}
