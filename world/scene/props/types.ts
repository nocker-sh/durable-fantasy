import type { GB } from "../gfx"

export interface Thing {
  name: string
  /** where it is found */
  group: "灰の暮らし" | "軒先" | "水と火" | "仕事" | "生き物"
  /** stands against a wall (laid along it) or hangs on one (takes no ground) */
  wall?: "stand" | "hang"
  /** the ground it takes (radius in tiles; 0 takes none) */
  r: number
  build: (gb: GB, x: number, z: number, seed: number, along: boolean) => void
}
