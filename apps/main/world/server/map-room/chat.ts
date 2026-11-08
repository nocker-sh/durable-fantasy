import { handleSpeech } from "#/world/server/map-room/handle-speech"
import { handleWhisper } from "#/world/server/map-room/handle-whisper"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = { say: handleSpeech, whisper: handleWhisper }
