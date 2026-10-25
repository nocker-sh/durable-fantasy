import { colorMat } from "../gfx"
import { M, crate, sack } from "../build"
import { blockCircle, blockRect } from "../world"
import type { Thing } from "./types.ts"
import { y0, furBlack, ash, wicker, clay, clayDark, straw } from "./materials.ts"

const eavesThings: Readonly<Record<string, Thing>> = {
  stool: {
    name: "軒下の腰掛け",
    group: "軒先",
    r: 0.22,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.cyl(M.wood, M.wood, x, z, y + 0.38, y + 0.43, 0.17, 0.17, 8, 1)
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2
        gb.box(M.woodDark, null, x + Math.cos(a) * 0.1 - 0.02, y, z + Math.sin(a) * 0.1 - 0.02, x + Math.cos(a) * 0.1 + 0.02, y + 0.38, z + Math.sin(a) * 0.1 + 0.02, 1)
      }
      blockCircle(x, z, 0.18)
    },
  },
  boots: {
    name: "戸口に脱いだ長靴",
    group: "軒先",
    r: 0,
    build: (gb, x, z) => {
      const y = y0(x, z)
      for (const o of [-0.08, 0.08]) {
        gb.box(furBlack, null, x + o - 0.05, y, z - 0.04, x + o + 0.05, y + 0.28, z + 0.05, 1)
        gb.box(furBlack, ash, x + o - 0.05, y, z + 0.05, x + o + 0.05, y + 0.07, z + 0.14, 1)
      }
    },
  },
  "basket-stack": {
    name: "重ねた籠",
    group: "軒先",
    r: 0.25,
    build: (gb, x, z) => {
      const y = y0(x, z)
      for (let k = 0; k < 3; k++) gb.cyl(wicker, k === 2 ? ash : null, x, z, y + k * 0.14, y + k * 0.14 + 0.16, 0.2 - k * 0.01, 0.24 - k * 0.01, 8, 1)
      blockCircle(x, z, 0.24)
    },
  },
  pots: {
    name: "素焼きの鉢の重ね",
    group: "軒先",
    r: 0.2,
    build: (gb, x, z) => {
      const y = y0(x, z)
      for (let k = 0; k < 4; k++) gb.cyl(k % 2 ? clay : clayDark, clayDark, x, z, y + k * 0.06, y + k * 0.06 + 0.12, 0.1, 0.15, 8, 1)
      blockCircle(x, z, 0.16)
    },
  },
  crock: {
    name: "漬物の甕",
    group: "軒先",
    r: 0.22,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.cyl(clayDark, null, x, z, y, y + 0.42, 0.16, 0.2, 9, 1)
      gb.cyl(M.woodDark, M.wood, x, z, y + 0.42, y + 0.46, 0.17, 0.17, 9, 1)
      gb.box(M.stone, M.stone, x - 0.06, y + 0.46, z - 0.05, x + 0.06, y + 0.53, z + 0.05, 1)
      blockCircle(x, z, 0.2)
    },
  },
  "sack-pile": {
    name: "袋の山",
    group: "軒先",
    r: 0.35,
    build: (gb, x, z) => {
      sack(gb, x - 0.15, z)
      sack(gb, x + 0.18, z + 0.05)
      sack(gb, x, z, y0(x, z) + 0.36)
      blockCircle(x, z, 0.34)
    },
  },
  "crate-stack": {
    name: "積んだ木箱",
    group: "軒先",
    r: 0.4,
    build: (gb, x, z) => {
      crate(gb, x, z, 0.5)
      crate(gb, x + 0.05, z, 0.42, y0(x, z) + 0.5, 0.3)
      blockCircle(x, z, 0.36)
    },
  },
  ladder: {
    name: "壁に立てかけた梯子",
    group: "軒先",
    wall: "stand",
    r: 0.2,
    build: (gb, x, z, _s, along) => {
      const y = y0(x, z)
      const [dx, dz] = along ? [0.2, 0] : [0, 0.2]
      for (const s of [-1, 1]) gb.box(M.woodV, null, x + s * dx - 0.025, y, z + s * dz - 0.025, x + s * dx + 0.025, y + 2.4, z + s * dz + 0.025, 1)
      for (let k = 1; k < 8; k++) gb.box(M.woodDark, null, x - dx - 0.02, y + k * 0.3, z - dz - 0.02, x + dx + 0.02, y + k * 0.3 + 0.04, z + dz + 0.02, 1)
      blockCircle(x, z, 0.18)
    },
  },
  postbox: {
    name: "郵便受け",
    group: "軒先",
    r: 0.12,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(M.woodDark, null, x - 0.03, y, z - 0.03, x + 0.03, y + 1.0, z + 0.03, 1)
      gb.box(M.wood, ash, x - 0.14, y + 1.0, z - 0.1, x + 0.14, y + 1.2, z + 0.1, 1)
      gb.box(M.iron, null, x - 0.08, y + 1.12, z + 0.1, x + 0.08, y + 1.14, z + 0.11, 1)
      blockCircle(x, z, 0.1)
    },
  },
  "onion-string": {
    name: "軒に吊るした玉ねぎ",
    group: "軒先",
    wall: "hang",
    r: 0,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(M.rope, null, x - 0.01, y + 1.3, z - 0.01, x + 0.01, y + 1.9, z + 0.01, 1)
      for (let k = 0; k < 5; k++) gb.box(clay, null, x - 0.05, y + 1.35 + k * 0.1, z - 0.05, x + 0.05, y + 1.43 + k * 0.1, z + 0.05, 1)
    },
  },
  "herb-bundle": {
    name: "軒に干した薬草の束",
    group: "軒先",
    wall: "hang",
    r: 0,
    build: (gb, x, z) => {
      const y = y0(x, z)
      for (let k = 0; k < 3; k++) {
        gb.box(M.rope, null, x - 0.2 + k * 0.2 - 0.01, y + 1.7, z - 0.01, x - 0.2 + k * 0.2 + 0.01, y + 1.9, z + 0.01, 1)
        gb.box(colorMat(0x5a6a3a), null, x - 0.2 + k * 0.2 - 0.05, y + 1.45, z - 0.03, x - 0.2 + k * 0.2 + 0.05, y + 1.72, z + 0.03, 1)
      }
    },
  },
  bench: {
    name: "戸口の長椅子",
    group: "軒先",
    wall: "stand",
    r: 0.3,
    build: (gb, x, z, _seed, along) => {
      const y = y0(x, z)
      const [hx, hz] = along ? [0.5, 0.15] : [0.15, 0.5]
      gb.box(M.wood, M.wood, x - hx, y + 0.38, z - hz, x + hx, y + 0.44, z + hz, 1)
      for (const s of [-1, 1]) {
        const lx = along ? x + s * (hx - 0.08) : x,
          lz = along ? z : z + s * (hz - 0.08)
        gb.box(M.woodDark, null, lx - 0.04, y, lz - 0.04, lx + 0.04, y + 0.38, lz + 0.04, 1)
      }
      blockRect(x - hx, z - hz, x + hx, z + hz)
    },
  },
  "flower-box": {
    name: "窓下の花箱（冬枯れ）",
    group: "軒先",
    wall: "hang",
    r: 0,
    build: (gb, x, z, seed, along) => {
      const y = y0(x, z) + 0.85
      const [hx, hz] = along ? [0.32, 0.09] : [0.09, 0.32]
      gb.box(M.woodDark, M.woodDark, x - hx, y, z - hz, x + hx, y + 0.14, z + hz, 1)
      // dry stems, and here and there a hardy green
      for (let k = 0; k < 5; k++) {
        const u = (k / 4 - 0.5) * 1.6
        const sx = x + (along ? u * hx : 0),
          sz = z + (along ? 0 : u * hz)
        gb.box((seed + k) % 3 ? straw : colorMat(0x4a5a3a), null, sx - 0.015, y + 0.14, sz - 0.015, sx + 0.015, y + 0.24 + ((seed + k) % 3) * 0.04, sz + 0.015, 1)
      }
    },
  },
}

export { eavesThings }
