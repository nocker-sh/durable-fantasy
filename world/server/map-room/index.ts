// Every message a map room answers, by its type.
import type { Handlers } from "#/world/server/map-room/context"
import { HANDLERS as chat } from "#/world/server/map-room/chat"
import { HANDLERS as moving } from "#/world/server/map-room/moving"
import { HANDLERS as work } from "#/world/server/map-room/work"
import { HANDLERS as exchange } from "#/world/server/map-room/exchange"
import { HANDLERS as combat } from "#/world/server/map-room/combat"
import { HANDLERS as trade } from "#/world/server/map-room/trade"
import { HANDLERS as threads } from "#/world/server/map-room/threads"
import { HANDLERS as party } from "#/world/server/map-room/party"
import { HANDLERS as partyChat } from "#/world/server/map-room/party-chat"
import { HANDLERS as heartbeat } from "#/world/server/map-room/heartbeat"

export const HANDLERS: Handlers = { ...moving, ...chat, ...work, ...exchange, ...combat, ...trade, ...threads, ...party, ...heartbeat, ...partyChat }
