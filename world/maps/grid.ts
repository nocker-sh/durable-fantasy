// The world is a grid of squares, north up (town.md「世界の升目」). Every outdoor map fills one
// square, all of one size (96 walk cells a side); the cities not built yet hold squares of their
// own. Maps side by side are joined where they meet: out of one map's west edge, in at the east
// edge of the map to the west, at the same place along it, where the drawn roads meet. A side can
// be walled (a town wall, a cliff, the sea), and then nothing crosses it. The ways between maps, the world map and the
// /dev grid are all worked out from this table.

import type { Side, Square } from "#/world/maps/grid-types"

export const GRID_SIZE = { cols: 5, rows: 5 } as const

export const WORLD: readonly Square[] = [
  { at: [0, 0], map: "phanthiet-market" },
  { at: [1, 0], map: "phanthiet" },
  { at: [2, 0], map: "phanthiet-craft", walls: ["s"] },
  { at: [3, 0], city: "クイニョン" },
  { at: [1, 1], map: "phanthiet-gate", walls: ["e"] },
  // the forest lies outside the town wall: the way in is from the forest's edge below
  { at: [2, 1], map: "deep-forest", walls: ["n", "w"] },
  { at: [3, 1], map: "quynhon-gate" },
  { at: [4, 1], city: "フエ" },
  { at: [1, 2], map: "south-meadow" },
  // cliffs between the forest's edge and the pass
  { at: [2, 2], map: "forest-edge", walls: ["e"] },
  { at: [3, 2], map: "mountain-pass", walls: ["w"] },
  { at: [4, 2], map: "hue-gate" },
  { at: [1, 3], map: "red-dunes" },
  { at: [2, 3], map: "net-sheds" },
  { at: [2, 4], map: "sea-cliff" },
]

export const STEP: Record<Side, readonly [number, number]> = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] }
export const OPPOSITE: Record<Side, Side> = { n: "s", e: "w", s: "n", w: "e" }
