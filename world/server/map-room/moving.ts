import { handleJoin } from "#/world/server/map-room/handle-join"
import { handleMove } from "#/world/server/map-room/handle-move"
import { handleEngage } from "#/world/server/map-room/handle-engage"
import { handleRevive } from "#/world/server/map-room/handle-revive"
import { handleShopLook } from "#/world/server/map-room/handle-shop-look"
import { handleWarp } from "#/world/server/map-room/handle-warp"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  join: handleJoin,
  move: handleMove,
  engage: handleEngage,
  revive: handleRevive,
  look: handleShopLook,
  warp: handleWarp,
}
