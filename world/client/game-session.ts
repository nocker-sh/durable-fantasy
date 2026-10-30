import { createGameState } from "#/world/client/initial-state"
import type { VoidSocket } from "void/ws"
import type { Transition } from "#/world/core/transition"
import type { Cell } from "#/world/protocol"
import type { WildView } from "#/world/client/wild-publication"
import { Others } from "#/world/parts/others"
import { Rooms } from "#/world/parts/rooms"

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
  wild: WildView = {}
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
