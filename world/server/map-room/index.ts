// Every message a map room answers, by its type.
import type { Handlers } from "./context.ts"
import { HANDLERS as moving } from "./moving.ts"
import { HANDLERS as work } from "./work.ts"
import { HANDLERS as exchange } from "./exchange.ts"
import { HANDLERS as combat } from "./combat.ts"
import { HANDLERS as trade } from "./trade.ts"
import { HANDLERS as threads } from "./threads.ts"
import { HANDLERS as party } from "./party.ts"

export const HANDLERS: Handlers = { ...moving, ...work, ...exchange, ...combat, ...trade, ...threads, ...party }
