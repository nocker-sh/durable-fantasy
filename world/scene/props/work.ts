import { colorMat } from "../gfx"
import { M } from "../build"
import { blockCircle, blockRect } from "../world"
import type { Thing } from "./types.ts"
import { y0, ash, cloth, clay, clayDark, straw, tin, wicker } from "./materials.ts"

const workThings: Readonly<Record<string, Thing>> = {
  wheelbarrow: {
    name: "手押し車",
    group: "仕事",
    r: 0.45,
    build: (gb, x, z, _s, along) => {
      const y = y0(x, z)
      const [l, w] = along ? [0.55, 0.3] : [0.3, 0.55]
      gb.box(M.wood, M.woodDark, x - l, y + 0.25, z - w, x + l, y + 0.45, z + w, 1)
      gb.box(ash, null, x - l + 0.04, y + 0.45, z - w + 0.04, x + l - 0.04, y + 0.47, z + w - 0.04, 1)
      gb.cyl(M.woodDark, M.woodDark, x + (along ? l : 0), z + (along ? 0 : w), y, y + 0.3, 0.15, 0.15, 8, 1)
      blockCircle(x, z, 0.45)
    },
  },
  sawhorse: {
    name: "木挽き台",
    group: "仕事",
    r: 0.4,
    build: (gb, x, z, _s, along) => {
      const y = y0(x, z)
      const [l, w] = along ? [0.45, 0.12] : [0.12, 0.45]
      gb.box(M.woodV, M.wood, x - l, y + 0.55, z - w, x + l, y + 0.62, z + w, 1)
      for (const s of [-1, 1])
        gb.box(
          M.woodDark,
          null,
          x + (along ? s * (l - 0.06) : 0) - 0.03,
          y,
          z + (along ? 0 : s * (w + 0.2)) - 0.15,
          x + (along ? s * (l - 0.06) : 0) + 0.03,
          y + 0.55,
          z + (along ? 0 : s * (w + 0.2)) + 0.15,
          1,
        )
      blockCircle(x, z, 0.36)
    },
  },
  grindstone: {
    name: "砥石車",
    group: "仕事",
    r: 0.35,
    build: (gb, x, z) => {
      const y = y0(x, z)
      gb.box(M.woodDark, null, x - 0.3, y, z - 0.15, x + 0.3, y + 0.45, z + 0.15, 1)
      gb.cyl(M.stone, M.stone, x, z, y + 0.45, y + 0.55, 0.28, 0.28, 10, 1)
      blockCircle(x, z, 0.32)
    },
  },
  washtub: {
    name: "洗い桶",
    group: "仕事",
    r: 0.35,
    build: (gb, x, z, seed) => {
      const y = y0(x, z)
      gb.cyl(M.woodV, null, x, z, y, y + 0.3, 0.3, 0.34, 10, 1)
      gb.cyl(M.water, M.water, x, z, y, y + 0.25, 0.01, 0.31, 10, 1)
      gb.box(cloth[seed % cloth.length], null, x - 0.2, y + 0.25, z - 0.1, x + 0.15, y + 0.29, z + 0.12, 1)
      gb.box(M.wood, null, x + 0.22, y + 0.05, z - 0.18, x + 0.26, y + 0.5, z + 0.18, 1)
      blockCircle(x, z, 0.34)
    },
  },
  "clay-jars": {
    name: "並べた壺",
    group: "仕事",
    r: 0.3,
    build: (gb, x, z, _s, along) => {
      const y = y0(x, z)
      for (let k = 0; k < 3; k++) {
        const o = (k - 1) * 0.22
        const [cx, cz] = along ? [x + o, z] : [x, z + o]
        gb.cyl(k % 2 ? clay : clayDark, ash, cx, cz, y, y + 0.32 - k * 0.04, 0.08, 0.1, 8, 1)
      }
      if (along) blockRect(x - 0.35, z - 0.12, x + 0.35, z + 0.12)
      else blockRect(x - 0.12, z - 0.35, x + 0.12, z + 0.35)
    },
  },
  "hand-cart": {
    name: "手押しの荷車",
    group: "仕事",
    r: 0.5,
    build: (gb, x, z, seed, along) => {
      const y = y0(x, z)
      const [hx, hz] = along ? [0.45, 0.28] : [0.28, 0.45]
      gb.box(M.wood, M.woodDark, x - hx, y + 0.3, z - hz, x + hx, y + 0.5, z + hz, 1)
      // a wheel each side, and the handles
      for (const s of [-1, 1]) {
        const wx = along ? x : x + s * (hx + 0.03),
          wz = along ? z + s * (hz + 0.03) : z
        const [ax, az] = along ? [0.24, 0.03] : [0.03, 0.24]
        gb.box(M.woodDark, M.woodDark, wx - ax, y, wz - az, wx + ax, y + 0.48, wz + az, 1)
      }
      const hxs = along ? x + hx : x,
        hzs = along ? z : z + hz
      gb.box(M.woodV, null, hxs - 0.03, y + 0.45, hzs - 0.03, hxs + (along ? 0.4 : 0.03), y + 0.5, hzs + (along ? 0.03 : 0.4), 1)
      if (seed % 2) gb.box(straw, ash, x - hx + 0.05, y + 0.5, z - hz + 0.05, x + hx - 0.05, y + 0.62, z + hz - 0.05, 1)
      blockRect(x - hx - 0.05, z - hz - 0.05, x + hx + 0.05, z + hz + 0.05)
    },
  },
  "milk-churns": {
    name: "乳缶",
    group: "仕事",
    r: 0.25,
    build: (gb, x, z) => {
      const y = y0(x, z)
      for (const [dx, dz] of [
        [-0.12, 0],
        [0.13, 0.05],
      ]) {
        gb.cyl(tin, tin, x + dx, z + dz, y, y + 0.45, 0.11, 0.09, 8, 1)
        gb.cyl(tin, tin, x + dx, z + dz, y + 0.45, y + 0.52, 0.06, 0.06, 6, 1)
      }
      blockCircle(x, z, 0.24)
    },
  },
  "hay-bale": {
    name: "干し草の束",
    group: "仕事",
    r: 0.4,
    build: (gb, x, z, _seed, along) => {
      const y = y0(x, z)
      const [hx, hz] = along ? [0.4, 0.25] : [0.25, 0.4]
      gb.box(straw, straw, x - hx, y, z - hz, x + hx, y + 0.36, z + hz, 1)
      gb.box(wicker, null, x - hx - 0.005, y + 0.12, z - hz - 0.005, x + hx + 0.005, y + 0.15, z + hz + 0.005, 1)
      blockRect(x - hx, z - hz, x + hx, z + hz)
    },
  },
  "tool-rack": {
    name: "壁の道具掛け（鋤と鍬）",
    group: "仕事",
    wall: "hang",
    r: 0,
    build: (gb, x, z, _seed, along) => {
      const y = y0(x, z)
      for (const [u, blade] of [
        [-0.2, M.iron],
        [0.05, M.iron],
        [0.28, M.wood],
      ] as const) {
        const tx = along ? x + u : x,
          tz = along ? z : z + u
        gb.box(M.woodV, null, tx - 0.02, y + 0.35, tz - 0.02, tx + 0.02, y + 1.4, tz + 0.02, 1)
        gb.box(blade, blade, tx - (along ? 0.08 : 0.02), y + 0.1, tz - (along ? 0.02 : 0.08), tx + (along ? 0.08 : 0.02), y + 0.38, tz + (along ? 0.02 : 0.08), 1)
      }
    },
  },
  "drying-hide": {
    name: "壁に張って干した皮",
    group: "仕事",
    wall: "hang",
    r: 0,
    build: (gb, x, z, seed, along) => {
      const y = y0(x, z) + 0.7
      const hide = colorMat([0x6a4a2e, 0x7a5a3a, 0x5a4030][seed % 3])
      const [hx, hz] = along ? [0.32, 0.02] : [0.02, 0.32]
      gb.box(hide, hide, x - hx, y, z - hz, x + hx, y + 0.6, z + hz, 1)
      gb.box(M.woodDark, null, x - hx - 0.04, y + 0.58, z - hz - 0.01, x + hx + 0.04, y + 0.63, z + hz + 0.01, 1)
    },
  },
  "rope-coil": {
    name: "壁の釘に掛けた縄",
    group: "仕事",
    wall: "hang",
    r: 0,
    build: (gb, x, z) => {
      const y = y0(x, z) + 1.1
      gb.cyl(wicker, wicker, x, z, y, y + 0.08, 0.16, 0.16, 10, 1)
      gb.cyl(wicker, wicker, x, z, y - 0.1, y, 0.13, 0.13, 10, 1)
    },
  },
}

export { workThings }
