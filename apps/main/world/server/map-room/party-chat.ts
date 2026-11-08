import { handlePartySpeech } from "#/world/server/map-room/handle-party-speech"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = { "party-say": handlePartySpeech }
