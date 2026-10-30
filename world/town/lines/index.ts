// Every resident's lines, gathered from the districts they live in.
import type { Line } from "#/world/town/lines/line"
import { LINES as craft } from "#/world/town/lines/craft"
import { LINES as gate } from "#/world/town/lines/gate"
import { LINES as market } from "#/world/town/lines/market"
import { LINES as square } from "#/world/town/lines/square"

export const ALL_LINES: Record<string, readonly Line[]> = { ...square, ...market, ...craft, ...gate }
