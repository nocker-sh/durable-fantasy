import type { ServerMessageContext } from "#/world/client/server-context"
import type { GameSession } from "#/world/client/game-session"
import type { SessionCallbacks } from "#/world/client/session"

export function createSessionContext(session: GameSession, callbacks: SessionCallbacks): ServerMessageContext {
  return { session, ...callbacks }
}
