import { handleHeartbeat } from "#/world/server/map-room/handle-heartbeat"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  heartbeat: handleHeartbeat,
}
