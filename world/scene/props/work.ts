import { createColorMaterial as colorMat } from "../../../lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { blockRect } from "#/world/scene/block-rect"
import type { Thing } from "./types"
import { y0 } from "#/world/scene/props/helpers/materials/y0"
import { ash, cloth, clay, clayDark, straw, tin, wicker } from "#/world/scene/props/materials"

const workThings: Readonly<Record<string, Thing>> = {
  wheelbarrow: {
    name: "手押し車",
    group: "仕事",
    r: 0.45,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _s = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const lState = along ? [0.55, 0.3] : [0.3, 0.55],
        l = lState[0],
        w = lState[1]
      gb.box({ side: M.wood, top: M.woodDark, x0: x - l, y0: y + 0.25, z0: z - w, x1: x + l, y1: y + 0.45, z1: z + w, repeat: 1 })
      gb.box({ side: ash, top: null, x0: x - l + 0.04, y0: y + 0.45, z0: z - w + 0.04, x1: x + l - 0.04, y1: y + 0.47, z1: z + w - 0.04, repeat: 1 })
      gb.cyl({ side: M.woodDark, top: M.woodDark, centerX: x + (along ? l : 0), centerZ: z + (along ? 0 : w), fromY: y, toY: y + 0.3, fromRadius: 0.15, toRadius: 0.15, segments: 8, repeat: 1 })
      blockCircle(x, z, 0.45)
    },
  },
  sawhorse: {
    name: "木挽き台",
    group: "仕事",
    r: 0.4,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _s = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const lState2 = along ? [0.45, 0.12] : [0.12, 0.45],
        l = lState2[0],
        w = lState2[1]
      gb.box({ side: M.woodV, top: M.wood, x0: x - l, y0: y + 0.55, z0: z - w, x1: x + l, y1: y + 0.62, z1: z + w, repeat: 1 })
      for (const s of [-1, 1])
        gb.box({
          side: M.woodDark,
          top: null,
          x0: x + (along ? s * (l - 0.06) : 0) - 0.03,
          y0: y,
          z0: z + (along ? 0 : s * (w + 0.2)) - 0.15,
          x1: x + (along ? s * (l - 0.06) : 0) + 0.03,
          y1: y + 0.55,
          z1: z + (along ? 0 : s * (w + 0.2)) + 0.15,
          repeat: 1,
        })
      blockCircle(x, z, 0.36)
    },
  },
  grindstone: {
    name: "砥石車",
    group: "仕事",
    r: 0.35,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.woodDark, top: null, x0: x - 0.3, y0: y, z0: z - 0.15, x1: x + 0.3, y1: y + 0.45, z1: z + 0.15, repeat: 1 })
      gb.cyl({ side: M.stone, top: M.stone, centerX: x, centerZ: z, fromY: y + 0.45, toY: y + 0.55, fromRadius: 0.28, toRadius: 0.28, segments: 10, repeat: 1 })
      blockCircle(x, z, 0.32)
    },
  },
  washtub: {
    name: "洗い桶",
    group: "仕事",
    r: 0.35,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed

      const y = y0(x, z)
      gb.cyl({ side: M.woodV, top: null, centerX: x, centerZ: z, fromY: y, toY: y + 0.3, fromRadius: 0.3, toRadius: 0.34, segments: 10, repeat: 1 })
      gb.cyl({ side: M.water, top: M.water, centerX: x, centerZ: z, fromY: y, toY: y + 0.25, fromRadius: 0.01, toRadius: 0.31, segments: 10, repeat: 1 })
      gb.box({ side: cloth[seed % cloth.length], top: null, x0: x - 0.2, y0: y + 0.25, z0: z - 0.1, x1: x + 0.15, y1: y + 0.29, z1: z + 0.12, repeat: 1 })
      gb.box({ side: M.wood, top: null, x0: x + 0.22, y0: y + 0.05, z0: z - 0.18, x1: x + 0.26, y1: y + 0.5, z1: z + 0.18, repeat: 1 })
      blockCircle(x, z, 0.34)
    },
  },
  "clay-jars": {
    name: "並べた壺",
    group: "仕事",
    r: 0.3,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _s = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      for (let k = 0; k < 3; k++) {
        const o = (k - 1) * 0.22
        const cxState = along ? [x + o, z] : [x, z + o],
          cx = cxState[0],
          cz = cxState[1]
        gb.cyl({ side: k % 2 ? clay : clayDark, top: ash, centerX: cx, centerZ: cz, fromY: y, toY: y + 0.32 - k * 0.04, fromRadius: 0.08, toRadius: 0.1, segments: 8, repeat: 1 })
      }
      if (along) blockRect({ x0: x - 0.35, z0: z - 0.12, x1: x + 0.35, z1: z + 0.12 })
      else blockRect({ x0: x - 0.12, z0: z - 0.35, x1: x + 0.12, z1: z + 0.35 })
    },
  },
  "hand-cart": {
    name: "手押しの荷車",
    group: "仕事",
    r: 0.5,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const hxState = along ? [0.45, 0.28] : [0.28, 0.45],
        hx = hxState[0],
        hz = hxState[1]
      gb.box({ side: M.wood, top: M.woodDark, x0: x - hx, y0: y + 0.3, z0: z - hz, x1: x + hx, y1: y + 0.5, z1: z + hz, repeat: 1 })
      // a wheel each side, and the handles
      for (const s of [-1, 1]) {
        const wx = along ? x : x + s * (hx + 0.03),
          wz = along ? z + s * (hz + 0.03) : z
        const axState = along ? [0.24, 0.03] : [0.03, 0.24],
          ax = axState[0],
          az = axState[1]
        gb.box({ side: M.woodDark, top: M.woodDark, x0: wx - ax, y0: y, z0: wz - az, x1: wx + ax, y1: y + 0.48, z1: wz + az, repeat: 1 })
      }
      const hxs = along ? x + hx : x,
        hzs = along ? z : z + hz
      gb.box({ side: M.woodV, top: null, x0: hxs - 0.03, y0: y + 0.45, z0: hzs - 0.03, x1: hxs + (along ? 0.4 : 0.03), y1: y + 0.5, z1: hzs + (along ? 0.03 : 0.4), repeat: 1 })
      if (seed % 2) gb.box({ side: straw, top: ash, x0: x - hx + 0.05, y0: y + 0.5, z0: z - hz + 0.05, x1: x + hx - 0.05, y1: y + 0.62, z1: z + hz - 0.05, repeat: 1 })
      blockRect({ x0: x - hx - 0.05, z0: z - hz - 0.05, x1: x + hx + 0.05, z1: z + hz + 0.05 })
    },
  },
  "milk-churns": {
    name: "乳缶",
    group: "仕事",
    r: 0.25,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      for (const entry of [
        [-0.12, 0],
        [0.13, 0.05],
      ]) {
        const dx = entry[0]
        const dz = entry[1]

        gb.cyl({ side: tin, top: tin, centerX: x + dx, centerZ: z + dz, fromY: y, toY: y + 0.45, fromRadius: 0.11, toRadius: 0.09, segments: 8, repeat: 1 })
        gb.cyl({ side: tin, top: tin, centerX: x + dx, centerZ: z + dz, fromY: y + 0.45, toY: y + 0.52, fromRadius: 0.06, toRadius: 0.06, segments: 6, repeat: 1 })
      }
      blockCircle(x, z, 0.24)
    },
  },
  "hay-bale": {
    name: "干し草の束",
    group: "仕事",
    r: 0.4,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const hxState2 = along ? [0.4, 0.25] : [0.25, 0.4],
        hx = hxState2[0],
        hz = hxState2[1]
      gb.box({ side: straw, top: straw, x0: x - hx, y0: y, z0: z - hz, x1: x + hx, y1: y + 0.36, z1: z + hz, repeat: 1 })
      gb.box({ side: wicker, top: null, x0: x - hx - 0.005, y0: y + 0.12, z0: z - hz - 0.005, x1: x + hx + 0.005, y1: y + 0.15, z1: z + hz + 0.005, repeat: 1 })
      blockRect({ x0: x - hx, z0: z - hz, x1: x + hx, z1: z + hz })
    },
  },
  "tool-rack": {
    name: "壁の道具掛け（鋤と鍬）",
    group: "仕事",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      for (const entry2 of [
        [-0.2, M.iron],
        [0.05, M.iron],
        [0.28, M.wood],
      ] as const) {
        const u = entry2[0]
        const blade = entry2[1]

        const tx = along ? x + u : x,
          tz = along ? z : z + u
        gb.box({ side: M.woodV, top: null, x0: tx - 0.02, y0: y + 0.35, z0: tz - 0.02, x1: tx + 0.02, y1: y + 1.4, z1: tz + 0.02, repeat: 1 })
        gb.box({
          side: blade,
          top: blade,
          x0: tx - (along ? 0.08 : 0.02),
          y0: y + 0.1,
          z0: tz - (along ? 0.02 : 0.08),
          x1: tx + (along ? 0.08 : 0.02),
          y1: y + 0.38,
          z1: tz + (along ? 0.02 : 0.08),
          repeat: 1,
        })
      }
    },
  },
  "drying-hide": {
    name: "壁に張って干した皮",
    group: "仕事",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z) + 0.7
      const hide = colorMat([0x6a4a2e, 0x7a5a3a, 0x5a4030][seed % 3])
      const hxState3 = along ? [0.32, 0.02] : [0.02, 0.32],
        hx = hxState3[0],
        hz = hxState3[1]
      gb.box({ side: hide, top: hide, x0: x - hx, y0: y, z0: z - hz, x1: x + hx, y1: y + 0.6, z1: z + hz, repeat: 1 })
      gb.box({ side: M.woodDark, top: null, x0: x - hx - 0.04, y0: y + 0.58, z0: z - hz - 0.01, x1: x + hx + 0.04, y1: y + 0.63, z1: z + hz + 0.01, repeat: 1 })
    },
  },
  "rope-coil": {
    name: "壁の釘に掛けた縄",
    group: "仕事",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z) + 1.1
      gb.cyl({ side: wicker, top: wicker, centerX: x, centerZ: z, fromY: y, toY: y + 0.08, fromRadius: 0.16, toRadius: 0.16, segments: 10, repeat: 1 })
      gb.cyl({ side: wicker, top: wicker, centerX: x, centerZ: z, fromY: y - 0.1, toY: y, fromRadius: 0.13, toRadius: 0.13, segments: 10, repeat: 1 })
    },
  },
}

export { workThings }
