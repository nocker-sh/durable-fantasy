// The game's clock is the real time in Japan (game-system.md §7.5). The light follows the hour
// along a smooth curve: long nights, a short pale day, a red dusk.

/** Minutes since midnight, Japan time. */
import { smooth } from "../../lib/engine/math.ts";

export function jstMinutes(now: number): number {
  const m = Math.floor(now / 60_000) + 9 * 60;
  return ((m % 1440) + 1440) % 1440;
}

/** How much daylight there is, 0 (night) to 1 (full day). */
export function daylight(min: number): number {
  return smooth(9 * 60, 10.5 * 60, min) * (1 - smooth(15.5 * 60, 17.5 * 60, min));
}

/** How red the light is: the dawn and, more, the dusk. */
export function dusk(min: number): number {
  const evening = smooth(15 * 60, 16.5 * 60, min) * (1 - smooth(17 * 60, 18 * 60, min));
  const morning = smooth(8.8 * 60, 9.6 * 60, min) * (1 - smooth(9.8 * 60, 10.6 * 60, min)) * 0.5;
  return Math.max(evening, morning);
}

export type Phase = "夜" | "夜明け" | "昼" | "夕暮れ";
export function phase(min: number): Phase {
  if (min >= 9 * 60 && min < 10.5 * 60) return "夜明け";
  if (min >= 10.5 * 60 && min < 15.5 * 60) return "昼";
  if (min >= 15.5 * 60 && min < 17.5 * 60) return "夕暮れ";
  return "夜";
}

/** "HH:MM" → minutes, or null. */
export function parseTime(text: string | null): number | null {
  const m = text ? /^(\d{1,2}):(\d{2})$/.exec(text) : null;
  if (!m) return null;
  const h = Number(m[1]),
    mm = Number(m[2]);
  return h < 24 && mm < 60 ? h * 60 + mm : null;
}

export const formatTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(Math.floor(min % 60)).padStart(2, "0")}`;

/** Is `min` within [from, to), where the span may run past midnight. */
export function within(min: number, from: number, to: number): boolean {
  return from <= to ? min >= from && min < to : min >= from || min < to;
}
