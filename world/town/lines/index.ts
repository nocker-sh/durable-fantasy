// Every resident's lines, gathered from the districts they live in.
import type { Line } from "./line.ts"
import { LINES as craft } from "./craft.ts"
import { LINES as gate } from "./gate.ts"
import { LINES as market } from "./market.ts"
import { LINES as square } from "./square.ts"
import { LINES as fields } from "./fields.ts"

export const ALL_LINES: Record<string, readonly Line[]> = { ...square, ...market, ...craft, ...gate, ...fields }
