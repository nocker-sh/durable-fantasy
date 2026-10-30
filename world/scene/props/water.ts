import { M } from "#/world/scene/construction/materials"
import { barrel } from "#/world/scene/construction/barrel"
import { bucket } from "#/world/scene/construction/bucket"
import { blockCircle } from "#/world/scene/block-circle"
import { blockRect } from "#/world/scene/block-rect"
import type { Thing } from "./types"
import { y0 } from "#/world/scene/props/helpers/materials/y0"
import { wicker } from "#/world/scene/props/materials"
import { lanternGlass } from "#/world/scene/props/helpers/materials/lantern-glass"

const waterThings: Readonly<Record<string, Thing>> = {
  "lidded-bucket": {
    name: "蓋をした水桶",
    group: "水と火",
    r: 0.2,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      bucket({ gb: gb, x: x, z: z, y: y, water: false })
      gb.cyl({ side: M.wood, top: M.wood, centerX: x, centerZ: z, fromY: y + 0.24, toY: y + 0.27, fromRadius: 0.16, toRadius: 0.16, segments: 8, repeat: 1 })
      blockCircle(x, z, 0.18)
    },
  },
  "water-butt": {
    name: "蓋をした雨水樽",
    group: "水と火",
    r: 0.35,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      barrel({ gb: gb, x: x, z: z, h: 0.85, r: 0.32 })
      gb.cyl({ side: M.wood, top: M.wood, centerX: x, centerZ: z, fromY: y + 0.85, toY: y + 0.9, fromRadius: 0.34, toRadius: 0.34, segments: 10, repeat: 1 })
      gb.box({ side: M.iron, top: null, x0: x - 0.03, y0: y + 0.9, z0: z - 0.15, x1: x + 0.03, y1: y + 0.95, z1: z + 0.15, repeat: 1 })
      blockCircle(x, z, 0.34)
    },
  },
  kindling: {
    name: "焚きつけの束",
    group: "水と火",
    r: 0.2,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _s = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      for (let k = 0; k < 7; k++) {
        const o = (k - 3) * 0.04
        if (along) gb.box({ side: M.woodV, top: null, x0: x - 0.3, y0: y + 0.02 + (k % 2) * 0.04, z0: z + o - 0.015, x1: x + 0.3, y1: y + 0.05 + (k % 2) * 0.04, z1: z + o + 0.015, repeat: 1 })
        else gb.box({ side: M.woodV, top: null, x0: x + o - 0.015, y0: y + 0.02 + (k % 2) * 0.04, z0: z - 0.3, x1: x + o + 0.015, y1: y + 0.05 + (k % 2) * 0.04, z1: z + 0.3, repeat: 1 })
      }
      gb.cyl({ side: M.rope, top: null, centerX: x, centerZ: z, fromY: y + 0.03, toY: y + 0.12, fromRadius: 0.08, toRadius: 0.08, segments: 6, repeat: 1 })
      blockCircle(x, z, 0.2)
    },
  },
  "log-basket": {
    name: "薪籠",
    group: "水と火",
    r: 0.25,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.cyl({ side: wicker, top: null, centerX: x, centerZ: z, fromY: y, toY: y + 0.35, fromRadius: 0.22, toRadius: 0.26, segments: 8, repeat: 1 })
      for (let k = 0; k < 4; k++) gb.box({ side: M.woodV, top: M.woodDark, x0: x - 0.18 + k * 0.1, y0: y + 0.28, z0: z - 0.2, x1: x - 0.1 + k * 0.1, y1: y + 0.42, z1: z + 0.2, repeat: 1 })
      blockCircle(x, z, 0.24)
    },
  },
  "hand-lantern": {
    name: "軒に吊るした手提げランタン",
    group: "水と火",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.iron, top: null, x0: x - 0.08, y0: y + 1.75, z0: z - 0.08, x1: x + 0.08, y1: y + 1.78, z1: z + 0.08, repeat: 1 })
      gb.box({ side: M.iron, top: null, x0: x - 0.01, y0: y + 1.78, z0: z - 0.01, x1: x + 0.01, y1: y + 1.95, z1: z + 0.01, repeat: 1 })
      gb.box({ side: lanternGlass(), top: null, x0: x - 0.06, y0: y + 1.6, z0: z - 0.06, x1: x + 0.06, y1: y + 1.75, z1: z + 0.06, repeat: 1 })
    },
  },
  "wood-stack": {
    name: "壁ぎわに積んだ薪",
    group: "水と火",
    wall: "stand",
    r: 0.35,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const hxState = along ? [0.55, 0.18] : [0.18, 0.55],
        hx = hxState[0],
        hz = hxState[1]
      // split logs in rows, the ends showing, each row a little shorter
      for (let k = 0; k < 4; k++) {
        const t = k * 0.05
        gb.box({
          side: k % 2 ? M.wood : M.woodDark,
          top: M.wood,
          x0: x - hx + (along ? t : 0),
          y0: y + k * 0.16,
          z0: z - hz + (along ? 0 : t),
          x1: x + hx - (along ? t : 0),
          y1: y + k * 0.16 + 0.16,
          z1: z + hz - (along ? 0 : t),
          repeat: 1,
        })
      }
      void seed
      blockRect({ x0: x - hx, z0: z - hz, x1: x + hx, z1: z + hz })
    },
  },
  "bucket-yoke": {
    name: "壁に掛けた天秤棒と桶",
    group: "水と火",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z) + 1.3
      const hxState2 = along ? [0.5, 0.03] : [0.03, 0.5],
        hx = hxState2[0],
        hz = hxState2[1]
      gb.box({ side: M.woodV, top: null, x0: x - hx, y0: y, z0: z - hz, x1: x + hx, y1: y + 0.05, z1: z + hz, repeat: 1 })
      for (const s of [-1, 1]) {
        const bx = along ? x + s * 0.4 : x,
          bz = along ? z : z + s * 0.4
        gb.cyl({ side: M.wood, top: M.woodDark, centerX: bx, centerZ: bz, fromY: y - 0.45, toY: y - 0.15, fromRadius: 0.1, toRadius: 0.12, segments: 8, repeat: 1 })
      }
    },
  },
}

export { waterThings }
