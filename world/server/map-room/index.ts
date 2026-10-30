// Every message a map room answers, by its type.
import type { Handlers } from "./context"
import { HANDLERS as chat } from "./chat"
import { HANDLERS as moving } from "./moving"
import { HANDLERS as work } from "./work"
import { HANDLERS as exchange } from "./exchange"
import { HANDLERS as combat } from "./combat"
import { HANDLERS as trade } from "./trade"
import { HANDLERS as threads } from "./threads"
import { HANDLERS as party } from "./party"
import { HANDLERS as partyChat } from "#/world/server/map-room/party-chat"
import { HANDLERS as heartbeat } from "./heartbeat"

export const HANDLERS: Handlers = { ...moving, ...chat, ...work, ...exchange, ...combat, ...trade, ...threads, ...party, ...heartbeat, ...partyChat }
