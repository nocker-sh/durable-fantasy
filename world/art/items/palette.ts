import { OUTLINE, hex, RAMPS, type RGB } from "../../scene/pix.ts"

const k = OUTLINE

const r = (ramp: string, i: number) => RAMPS[ramp][i]

const ramp3 = (ramp: string): Record<string, RGB> => ({ h: r(ramp, 4), m: r(ramp, 2), s: r(ramp, 0) })

const hexes = (h: string, m: string, s: string) => ({ h: hex(h), m: hex(m), s: hex(s) })

export { k, r, ramp3, hexes }
