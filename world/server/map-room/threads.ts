import { handleThreadAsk } from "#/world/server/map-room/handle-thread-ask"
import { handleThreadAnswer } from "#/world/server/map-room/handle-thread-answer"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  "thread-ask": handleThreadAsk,
  "thread-answer": handleThreadAnswer,
}
