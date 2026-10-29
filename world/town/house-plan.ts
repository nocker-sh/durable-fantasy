import type { Room, Plan } from "./house-types.ts"

/**
 * What every household lives with, whatever its trade (town.md「世帯と建物」): a table to eat at,
 * a water jar, a box of firewood by the hearth, a chest for clothes and somewhere to keep food.
 * A plan that names one of a kind keeps its own; the rest are added.
 */
const ESSENTIALS: readonly [string, RegExp][] = [
  ["食卓", /^(食卓|大きな食卓|長卓|卓)$/],
  ["水甕", /^水甕$/],
  ["薪入れ", /^(薪入れ|薪の山)$/],
  ["衣装箱", /^(衣装箱|箪笥|長持)$/],
  ["保存食の棚", /^(保存食の棚|野菜籠|パン籠|果物籠|粉箱|魚桶)$/],
]

const named = (f: string) => f.replace(/（.+）$/, "").replace(/×\d+$/, "")

/** The things of everyday life missing from a household's furniture. */
const missing = (furniture: readonly string[]) => ESSENTIALS.filter(([, re]) => !furniture.some((f) => re.test(named(f)))).map(([name]) => name)

const home = (rooms: Room[], furniture: string[], workshop?: string): Plan => ({ rooms, hearth: true, kitchen: true, workshop, furniture: [...furniture, ...(rooms.some((r) => r.beds) ? missing(furniture) : [])] })
const bed = (name: string, floor: number, beds: number): Room => ({ name, floor, beds })
const room = (name: string, floor: number): Room => ({ name, floor })

export { home, bed, room, ESSENTIALS, missing }
