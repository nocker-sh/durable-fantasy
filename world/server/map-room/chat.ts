import { handleSpeech } from "#/world/server/map-room/handle-speech"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = { say: handleSpeech }
