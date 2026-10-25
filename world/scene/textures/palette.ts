import { RAMPS, type RGB } from "../pix";

export const PPU = 32;

const S = PPU / 16;

/** A ramp's colour at a level (0 darkest), clamped. */
const lvl = (ramp: string, i: number): RGB => {
  const r = RAMPS[ramp];
  return r[Math.max(0, Math.min(r.length - 1, Math.round(i)))];
};

export { S, lvl };
