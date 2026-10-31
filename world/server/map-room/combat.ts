import { handleAttack } from "#/world/server/map-room/handle-attack"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  attack: handleAttack,
}
