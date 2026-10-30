import { createColorMaterial as colorMat } from "../../../lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { blockCircle } from "#/world/scene/block-circle"
import { blockRect } from "#/world/scene/block-rect"
import type { Thing } from "./types"
import { y0 } from "#/world/scene/props/helpers/materials/y0"
import { furBlack, ash, wicker, clay, clayDark, straw } from "#/world/scene/props/materials"

const eavesThings: Readonly<Record<string, Thing>> = {
  stool: {
    name: "軒下の腰掛け",
    group: "軒先",
    r: 0.22,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.cyl({ side: M.wood, top: M.wood, centerX: x, centerZ: z, fromY: y + 0.38, toY: y + 0.43, fromRadius: 0.17, toRadius: 0.17, segments: 8, repeat: 1 })
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2
        gb.box({
          side: M.woodDark,
          top: null,
          x0: x + Math.cos(a) * 0.1 - 0.02,
          y0: y,
          z0: z + Math.sin(a) * 0.1 - 0.02,
          x1: x + Math.cos(a) * 0.1 + 0.02,
          y1: y + 0.38,
          z1: z + Math.sin(a) * 0.1 + 0.02,
          repeat: 1,
        })
      }
      blockCircle(x, z, 0.18)
    },
  },
  boots: {
    name: "戸口に脱いだ長靴",
    group: "軒先",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      for (const o of [-0.08, 0.08]) {
        gb.box({ side: furBlack, top: null, x0: x + o - 0.05, y0: y, z0: z - 0.04, x1: x + o + 0.05, y1: y + 0.28, z1: z + 0.05, repeat: 1 })
        gb.box({ side: furBlack, top: ash, x0: x + o - 0.05, y0: y, z0: z + 0.05, x1: x + o + 0.05, y1: y + 0.07, z1: z + 0.14, repeat: 1 })
      }
    },
  },
  "basket-stack": {
    name: "重ねた籠",
    group: "軒先",
    r: 0.25,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      for (let k = 0; k < 3; k++)
        gb.cyl({
          side: wicker,
          top: k === 2 ? ash : null,
          centerX: x,
          centerZ: z,
          fromY: y + k * 0.14,
          toY: y + k * 0.14 + 0.16,
          fromRadius: 0.2 - k * 0.01,
          toRadius: 0.24 - k * 0.01,
          segments: 8,
          repeat: 1,
        })
      blockCircle(x, z, 0.24)
    },
  },
  pots: {
    name: "素焼きの鉢の重ね",
    group: "軒先",
    r: 0.2,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      for (let k = 0; k < 4; k++)
        gb.cyl({ side: k % 2 ? clay : clayDark, top: clayDark, centerX: x, centerZ: z, fromY: y + k * 0.06, toY: y + k * 0.06 + 0.12, fromRadius: 0.1, toRadius: 0.15, segments: 8, repeat: 1 })
      blockCircle(x, z, 0.16)
    },
  },
  crock: {
    name: "漬物の甕",
    group: "軒先",
    r: 0.22,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.cyl({ side: clayDark, top: null, centerX: x, centerZ: z, fromY: y, toY: y + 0.42, fromRadius: 0.16, toRadius: 0.2, segments: 9, repeat: 1 })
      gb.cyl({ side: M.woodDark, top: M.wood, centerX: x, centerZ: z, fromY: y + 0.42, toY: y + 0.46, fromRadius: 0.17, toRadius: 0.17, segments: 9, repeat: 1 })
      gb.box({ side: M.stone, top: M.stone, x0: x - 0.06, y0: y + 0.46, z0: z - 0.05, x1: x + 0.06, y1: y + 0.53, z1: z + 0.05, repeat: 1 })
      blockCircle(x, z, 0.2)
    },
  },
  "sack-pile": {
    name: "袋の山",
    group: "軒先",
    r: 0.35,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      sack({ gb: gb, x: x - 0.15, z: z })
      sack({ gb: gb, x: x + 0.18, z: z + 0.05 })
      sack({ gb: gb, x: x, z: z, y: y0(x, z) + 0.36 })
      blockCircle(x, z, 0.34)
    },
  },
  "crate-stack": {
    name: "積んだ木箱",
    group: "軒先",
    r: 0.4,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      crate({ gb: gb, x: x, z: z, s: 0.5 })
      crate({ gb: gb, x: x + 0.05, z: z, s: 0.42, y: y0(x, z) + 0.5, rot: 0.3 })
      blockCircle(x, z, 0.36)
    },
  },
  ladder: {
    name: "壁に立てかけた梯子",
    group: "軒先",
    wall: "stand",
    r: 0.2,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _s = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const dxState = along ? [0.2, 0] : [0, 0.2],
        dx = dxState[0],
        dz = dxState[1]
      for (const s of [-1, 1]) gb.box({ side: M.woodV, top: null, x0: x + s * dx - 0.025, y0: y, z0: z + s * dz - 0.025, x1: x + s * dx + 0.025, y1: y + 2.4, z1: z + s * dz + 0.025, repeat: 1 })
      for (let k = 1; k < 8; k++)
        gb.box({ side: M.woodDark, top: null, x0: x - dx - 0.02, y0: y + k * 0.3, z0: z - dz - 0.02, x1: x + dx + 0.02, y1: y + k * 0.3 + 0.04, z1: z + dz + 0.02, repeat: 1 })
      blockCircle(x, z, 0.18)
    },
  },
  postbox: {
    name: "郵便受け",
    group: "軒先",
    r: 0.12,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.woodDark, top: null, x0: x - 0.03, y0: y, z0: z - 0.03, x1: x + 0.03, y1: y + 1.0, z1: z + 0.03, repeat: 1 })
      gb.box({ side: M.wood, top: ash, x0: x - 0.14, y0: y + 1.0, z0: z - 0.1, x1: x + 0.14, y1: y + 1.2, z1: z + 0.1, repeat: 1 })
      gb.box({ side: M.iron, top: null, x0: x - 0.08, y0: y + 1.12, z0: z + 0.1, x1: x + 0.08, y1: y + 1.14, z1: z + 0.11, repeat: 1 })
      blockCircle(x, z, 0.1)
    },
  },
  "onion-string": {
    name: "軒に吊るした玉ねぎ",
    group: "軒先",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      gb.box({ side: M.rope, top: null, x0: x - 0.01, y0: y + 1.3, z0: z - 0.01, x1: x + 0.01, y1: y + 1.9, z1: z + 0.01, repeat: 1 })
      for (let k = 0; k < 5; k++) gb.box({ side: clay, top: null, x0: x - 0.05, y0: y + 1.35 + k * 0.1, z0: z - 0.05, x1: x + 0.05, y1: y + 1.43 + k * 0.1, z1: z + 0.05, repeat: 1 })
    },
  },
  "herb-bundle": {
    name: "軒に干した薬草の束",
    group: "軒先",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z

      const y = y0(x, z)
      for (let k = 0; k < 3; k++) {
        gb.box({ side: M.rope, top: null, x0: x - 0.2 + k * 0.2 - 0.01, y0: y + 1.7, z0: z - 0.01, x1: x - 0.2 + k * 0.2 + 0.01, y1: y + 1.9, z1: z + 0.01, repeat: 1 })
        gb.box({ side: colorMat(0x5a6a3a), top: null, x0: x - 0.2 + k * 0.2 - 0.05, y0: y + 1.45, z0: z - 0.03, x1: x - 0.2 + k * 0.2 + 0.05, y1: y + 1.72, z1: z + 0.03, repeat: 1 })
      }
    },
  },
  bench: {
    name: "戸口の長椅子",
    group: "軒先",
    wall: "stand",
    r: 0.3,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const _seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z)
      const hxState = along ? [0.5, 0.15] : [0.15, 0.5],
        hx = hxState[0],
        hz = hxState[1]
      gb.box({ side: M.wood, top: M.wood, x0: x - hx, y0: y + 0.38, z0: z - hz, x1: x + hx, y1: y + 0.44, z1: z + hz, repeat: 1 })
      for (const s of [-1, 1]) {
        const lx = along ? x + s * (hx - 0.08) : x,
          lz = along ? z : z + s * (hz - 0.08)
        gb.box({ side: M.woodDark, top: null, x0: lx - 0.04, y0: y, z0: lz - 0.04, x1: lx + 0.04, y1: y + 0.38, z1: lz + 0.04, repeat: 1 })
      }
      blockRect({ x0: x - hx, z0: z - hz, x1: x + hx, z1: z + hz })
    },
  },
  "flower-box": {
    name: "窓下の花箱（冬枯れ）",
    group: "軒先",
    wall: "hang",
    r: 0,
    build: (inputProps) => {
      const gb = inputProps.builder
      const x = inputProps.x
      const z = inputProps.z
      const seed = inputProps.seed
      const along = inputProps.along

      const y = y0(x, z) + 0.85
      const hxState2 = along ? [0.32, 0.09] : [0.09, 0.32],
        hx = hxState2[0],
        hz = hxState2[1]
      gb.box({ side: M.woodDark, top: M.woodDark, x0: x - hx, y0: y, z0: z - hz, x1: x + hx, y1: y + 0.14, z1: z + hz, repeat: 1 })
      // dry stems, and here and there a hardy green
      for (let k = 0; k < 5; k++) {
        const u = (k / 4 - 0.5) * 1.6
        const sx = x + (along ? u * hx : 0),
          sz = z + (along ? 0 : u * hz)
        gb.box({
          side: (seed + k) % 3 ? straw : colorMat(0x4a5a3a),
          top: null,
          x0: sx - 0.015,
          y0: y + 0.14,
          z0: sz - 0.015,
          x1: sx + 0.015,
          y1: y + 0.24 + ((seed + k) % 3) * 0.04,
          z1: sz + 0.015,
          repeat: 1,
        })
      }
    },
  },
}

export { eavesThings }
