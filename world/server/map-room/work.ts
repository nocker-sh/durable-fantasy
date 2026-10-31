import { handlePlayerCommand } from "#/world/server/map-room/handle-player-command"
import { handleGather } from "#/world/server/map-room/handle-gather"
import { handleCraft } from "#/world/server/map-room/handle-craft"
import { handleCommission } from "#/world/server/map-room/handle-commission"
import { handleStorage } from "#/world/server/map-room/handle-storage"
import { handleErrand } from "#/world/server/map-room/handle-errand"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  command: handlePlayerCommand,
  gather: handleGather,
  craft: handleCraft,
  order: handleCommission,
  collect: handleCommission,
  storage: handleStorage,
  errand: handleErrand,
}
