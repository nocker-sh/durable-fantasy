// Every resident's lines, gathered from the districts they live in.
import type { Line } from "#/world/town/lines/line"
import { LINES as craft } from "./craft"
import { LINES as gate } from "./gate"
import { LINES as market } from "./market"
import { LINES as square } from "./square"

export const ALL_LINES: Record<string, readonly Line[]> = { ...square, ...market, ...craft, ...gate }
