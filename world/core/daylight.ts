import { smooth } from "#/lib/engine/smooth"

/** The game daylight curve follows the same real-world Japan time as the town. */
export function daylight(min: number): number {
  return smooth(9 * 60, 10.5 * 60, min) * (1 - smooth(15.5 * 60, 17.5 * 60, min))
}
