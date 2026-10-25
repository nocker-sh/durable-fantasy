import { LoadTimer, type Lap } from "../lib/engine/laps.ts";

const timer = new LoadTimer();
export const lapStart = (what: string) => timer.begin(what);
export const lap = (step: string) => timer.mark(step);
export function lapEnd(step: string) {
  const laps = timer.end(step);
  (globalThis as unknown as { __laps: Lap[][] }).__laps ??= [];
  (globalThis as unknown as { __laps: Lap[][] }).__laps.push(laps);
  if (import.meta.env.DEV) console.table(laps);
}
