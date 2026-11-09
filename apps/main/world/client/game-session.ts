import { createGameState } from "#/world/client/initial-state"
import type { VoidSocket } from "void/ws"
import type { Transition } from "#/world/core/transition"
import type { Cell } from "#/world/protocol"
import type { SkillId } from "#/world/core/skill-types"
import type { WildView } from "#/world/client/wild-publication"
import { Others } from "#/world/parts/others"
import { Mutes } from "#/world/parts/mutes"
import { Rooms } from "#/world/parts/rooms"
import { STORAGE } from "#/world/client/identity"

/** State owned by one live game session, shared by its client controllers. */
export class GameSession {
  readonly state = createGameState()
  socket: VoidSocket<"/map/:mapId"> | null = null
  playerId = ""
  partyChat = { party: "", seq: 0 }
  readonly others = new Others()
  readonly mutes = new Mutes({ state: this.state, key: `${STORAGE}/muted` })
  waiting = new Map<number, (result: Transition) => void>()
  arriveAt: Cell | null = null
  warpAskedAt = 0
  wild: WildView = {}
  engaged: string | null = null
  warping = false
  /** the last swing sent at a creature (performance clock) */
  fighting: { monster: string; at: number } | null = null
  /** an art waits for a swing and remains reserved until acceptance or cancellation (game-system.md §9.3) */
  art: { skill: SkillId; monster: string; at: number } | null = null
  refusedWarp = -1
  warpAgainAt = 0
  readonly rooms = new Rooms()
  wantChannel: number | null = null
  fullTries = 0
  /** joins in a row that a room took in but never answered; each next try waits longer (room-client.ts) */
  joinTries = 0
  net = { messages: 0, bytes: 0, since: performance.now() }
}
