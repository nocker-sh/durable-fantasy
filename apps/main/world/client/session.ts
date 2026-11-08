import type { ServerMessageContext } from "#/world/client/server-context"

export type SessionCallbacks = Omit<ServerMessageContext, "session">
