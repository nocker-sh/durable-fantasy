// What kind of day it is in town (economy.md §4.2): most days are ordinary; some bring a cold snap
// or a fog, and once a month the lantern festival. Decided by the date alone, the same for everyone.
export type TownEvent = "寒波" | "霧" | "祭りの前日" | "灯りの祭り";

const JST = 9 * 3_600_000;

/** The date in Japan as y, m, d. */
export function jstDate(now: number): { y: number; m: number; d: number } {
  const t = new Date(now + JST);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function hash(n: number): number {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * The lantern festival is on the 21st of every month (the night the goddess is said to have gone,
 * remembered with lanterns rather than mourning); cold snaps and fogs fall on about one day in ten.
 */
export function eventOf(now: number): TownEvent | null {
  const { y, m, d } = jstDate(now);
  if (d === 21) return "灯りの祭り";
  if (d === 20) return "祭りの前日";
  const r = hash(y * 400 + m * 32 + d);
  if (r < 0.1) return "寒波";
  if (r < 0.18) return "霧";
  return null;
}
