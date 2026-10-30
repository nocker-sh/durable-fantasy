import { M } from "#/world/scene/construction/materials"
import { crate } from "#/world/scene/construction/crate"
import { blockCircle } from "#/world/scene/block-circle"
import type { Thing } from "./types"
import { y0 } from "#/world/scene/props/helpers/materials/y0"
import { straw, ash, ashDark, wicker } from "#/world/scene/props/materials"

const ashThings: Readonly<Record<string, Thing>> = {
  "ash-broom": {
    name: "灰掃きの箒",
    group: "灰の暮らし",
    wall: "stand",
    r: 0.15,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.woodV, top: null, x0: x - 0.02, y0: y + 0.25, z0: z - 0.02, x1: x + 0.02, y1: y + 1.3, z1: z + 0.02, repeat: 1 })
      gb.box({ side: straw, top: straw, x0: x - 0.12, y0: y, z0: z - 0.05, x1: x + 0.12, y1: y + 0.3, z1: z + 0.05, repeat: 1 })
      blockCircle(x, z, 0.12)
    },
  },
  "ash-shovel": {
    name: "灰かきのシャベル",
    group: "灰の暮らし",
    wall: "stand",
    r: 0.15,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.woodV, top: null, x0: x - 0.02, y0: y + 0.3, z0: z - 0.02, x1: x + 0.02, y1: y + 1.2, z1: z + 0.02, repeat: 1 })
      gb.box({ side: M.iron, top: M.iron, x0: x - 0.13, y0: y, z0: z - 0.03, x1: x + 0.13, y1: y + 0.32, z1: z + 0.01, repeat: 1 })
      blockCircle(x, z, 0.12)
    },
  },
  "ash-heap": {
    name: "掃き寄せた灰の山",
    group: "灰の暮らし",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed

      const y = y0(x, z)
      for (let k = 0; k < 4; k++) {
        const dx = (((seed * 7 + k * 13) % 10) / 10 - 0.5) * 0.5,
          dz = (((seed * 3 + k * 17) % 10) / 10 - 0.5) * 0.3
        gb.cyl({
          side: k % 2 ? ash : ashDark,
          top: ash,
          centerX: x + dx,
          centerZ: z + dz,
          fromY: y - 0.02,
          toY: y + 0.06 + 0.04 * (k % 3),
          fromRadius: 0.18 + 0.05 * k,
          toRadius: 0.04,
          segments: 6,
          repeat: 1,
        })
      }
    },
  },
  "roof-rake": {
    name: "屋根の灰下ろしの熊手",
    group: "灰の暮らし",
    wall: "stand",
    r: 0.15,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.woodV, top: null, x0: x - 0.025, y0: y, z0: z - 0.025, x1: x + 0.025, y1: y + 2.2, z1: z + 0.025, repeat: 1 })
      gb.box({ side: M.woodDark, top: null, x0: x - 0.3, y0: y + 2.1, z0: z - 0.03, x1: x + 0.3, y1: y + 2.18, z1: z + 0.03, repeat: 1 })
      blockCircle(x, z, 0.12)
    },
  },
  "covered-goods": {
    name: "筵をかけた荷",
    group: "灰の暮らし",
    r: 0.4,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed

      const y = y0(x, z)
      crate({ gb: gb, x: x, z: z, s: 0.5 })
      gb.box({ side: straw, top: ash, x0: x - 0.32, y0: y + 0.5, z0: z - 0.32, x1: x + 0.32, y1: y + 0.56, z1: z + 0.32, repeat: 1 })
      gb.box({ side: straw, top: null, x0: x - 0.32, y0: y + 0.1, z0: z + 0.3, x1: x + 0.32, y1: y + 0.55, z1: z + 0.33, repeat: 1 })
      void seed
      blockCircle(x, z, 0.38)
    },
  },
  doormat: {
    name: "戸口の灰落としの筵",
    group: "灰の暮らし",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _s = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const wState = along ? [0.7, 0.4] : [0.4, 0.7],
        w = wState[0],
        d = wState[1]
      gb.box({ side: straw, top: ashDark, x0: x - w / 2, y0: y, z0: z - d / 2, x1: x + w / 2, y1: y + 0.015, z1: z + d / 2, repeat: 1 })
    },
  },
  "ash-sieve": {
    name: "灰ふるいの笊と台",
    group: "灰の暮らし",
    r: 0.25,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      for (const entry of [
        [-0.15, -0.15],
        [0.15, -0.15],
        [-0.15, 0.15],
        [0.15, 0.15],
      ]) {
        const dx = entry[0]
        const dz = entry[1]
        gb.box({ side: M.woodDark, top: null, x0: x + dx - 0.025, y0: y, z0: z + dz - 0.025, x1: x + dx + 0.025, y1: y + 0.5, z1: z + dz + 0.025, repeat: 1 })
      }
      gb.cyl({ side: wicker, top: ash, centerX: x, centerZ: z, fromY: y + 0.5, toY: y + 0.6, fromRadius: 0.26, toRadius: 0.28, segments: 10, repeat: 1 })
      gb.cyl({ side: ash, top: ash, centerX: x, centerZ: z, fromY: y, toY: y + 0.05, fromRadius: 0.2, toRadius: 0.15, segments: 8, repeat: 1 })
      blockCircle(x, z, 0.26)
    },
  },
}

export { ashThings }
