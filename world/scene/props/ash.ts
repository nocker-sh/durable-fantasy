import { M, crate } from "../build"
import { blockCircle } from "../world"
import type { Thing } from "./types.ts"
import { y0, straw, ash, ashDark, wicker } from "./materials.ts"

const ashThings: Readonly<Record<string, Thing>> = {
  "ash-broom": {
    name: "灰掃きの箒",
    group: "灰の暮らし",
    wall: "stand",
    r: 0.15,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(M.woodV, null, x - 0.02, y + 0.25, z - 0.02, x + 0.02, y + 1.3, z + 0.02, 1)
      gb.box(straw, straw, x - 0.12, y, z - 0.05, x + 0.12, y + 0.3, z + 0.05, 1)
      blockCircle(x, z, 0.12)
    },
  },
  "ash-shovel": {
    name: "灰かきのシャベル",
    group: "灰の暮らし",
    wall: "stand",
    r: 0.15,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(M.woodV, null, x - 0.02, y + 0.3, z - 0.02, x + 0.02, y + 1.2, z + 0.02, 1)
      gb.box(M.iron, M.iron, x - 0.13, y, z - 0.03, x + 0.13, y + 0.32, z + 0.01, 1)
      blockCircle(x, z, 0.12)
    },
  },
  "ash-heap": {
    name: "掃き寄せた灰の山",
    group: "灰の暮らし",
    r: 0,
    build: (gb, x, z, seed) => {
      const y = y0(x, z)
      for (let k = 0; k < 4; k++) {
        const dx = (((seed * 7 + k * 13) % 10) / 10 - 0.5) * 0.5,
          dz = (((seed * 3 + k * 17) % 10) / 10 - 0.5) * 0.3
        gb.cyl(k % 2 ? ash : ashDark, ash, x + dx, z + dz, y - 0.02, y + 0.06 + 0.04 * (k % 3), 0.18 + 0.05 * k, 0.04, 6, 1)
      }
    },
  },
  "roof-rake": {
    name: "屋根の灰下ろしの熊手",
    group: "灰の暮らし",
    wall: "stand",
    r: 0.15,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(M.woodV, null, x - 0.025, y, z - 0.025, x + 0.025, y + 2.2, z + 0.025, 1)
      gb.box(M.woodDark, null, x - 0.3, y + 2.1, z - 0.03, x + 0.3, y + 2.18, z + 0.03, 1)
      blockCircle(x, z, 0.12)
    },
  },
  "covered-goods": {
    name: "筵をかけた荷",
    group: "灰の暮らし",
    r: 0.4,
    build: (gb, x, z, seed) => {
      const y = y0(x, z)
      crate(gb, x, z, 0.5)
      gb.box(straw, ash, x - 0.32, y + 0.5, z - 0.32, x + 0.32, y + 0.56, z + 0.32, 1)
      gb.box(straw, null, x - 0.32, y + 0.1, z + 0.3, x + 0.32, y + 0.55, z + 0.33, 1)
      void seed
      blockCircle(x, z, 0.38)
    },
  },
  doormat: {
    name: "戸口の灰落としの筵",
    group: "灰の暮らし",
    r: 0,
    build: (gb, x, z, _s, along) => {
      const y = y0(x, z)
      const [w, d] = along ? [0.7, 0.4] : [0.4, 0.7]
      gb.box(straw, ashDark, x - w / 2, y, z - d / 2, x + w / 2, y + 0.015, z + d / 2, 1)
    },
  },
  "ash-sieve": {
    name: "灰ふるいの笊と台",
    group: "灰の暮らし",
    r: 0.25,
    build: (gb, x, z) => {
      const y = y0(x, z)
      for (const [dx, dz] of [
        [-0.15, -0.15],
        [0.15, -0.15],
        [-0.15, 0.15],
        [0.15, 0.15],
      ])
        gb.box(M.woodDark, null, x + dx - 0.025, y, z + dz - 0.025, x + dx + 0.025, y + 0.5, z + dz + 0.025, 1)
      gb.cyl(wicker, ash, x, z, y + 0.5, y + 0.6, 0.26, 0.28, 10, 1)
      gb.cyl(ash, ash, x, z, y, y + 0.05, 0.2, 0.15, 8, 1)
      blockCircle(x, z, 0.26)
    },
  },
}

export { ashThings }
