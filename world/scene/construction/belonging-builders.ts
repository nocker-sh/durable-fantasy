import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

import { M } from "#/world/scene/construction/materials"
import { r } from "#/world/scene/construction/helpers/belongings/r"
import { pick } from "#/world/scene/construction/helpers/belongings/pick"
import { garment } from "#/world/scene/construction/helpers/belongings/garment"
import { bunch } from "#/world/scene/construction/helpers/belongings/bunch"
import { string } from "#/world/scene/construction/helpers/belongings/string"
import { wallShelf } from "#/world/scene/construction/helpers/belongings/wall-shelf"
import { vessel } from "#/world/scene/construction/helpers/belongings/vessel"
import { candle } from "#/world/scene/construction/helpers/belongings/candle"
import { book } from "#/world/scene/construction/helpers/belongings/book"
import { papers } from "#/world/scene/construction/helpers/belongings/papers"
import { shoes } from "#/world/scene/construction/helpers/belongings/shoes"
import { basket } from "#/world/scene/construction/helpers/belongings/basket"
import { tool } from "#/world/scene/construction/helpers/belongings/tool"
import { frame } from "#/world/scene/construction/helpers/belongings/frame"
import { cloth } from "#/world/scene/construction/belongings"
import { linen } from "#/world/scene/construction/belongings"
import { leather } from "#/world/scene/construction/belongings"
import { paper } from "#/world/scene/construction/belongings"
import { ink } from "#/world/scene/construction/belongings"
import { clay } from "#/world/scene/construction/belongings"
import { glaze } from "#/world/scene/construction/belongings"
import { brass } from "#/world/scene/construction/belongings"
import { wax } from "#/world/scene/construction/belongings"
import { herb } from "#/world/scene/construction/belongings"
import { onion } from "#/world/scene/construction/belongings"
import { garlic } from "#/world/scene/construction/belongings"
import { slate } from "#/world/scene/construction/belongings"
import { crystal } from "#/world/scene/construction/belongings"
import { bread } from "#/world/scene/construction/belongings"
import { cheese } from "#/world/scene/construction/belongings"
import { apple } from "#/world/scene/construction/belongings"
import { fish } from "#/world/scene/construction/belongings"
import { meat } from "#/world/scene/construction/belongings"
import { hide } from "#/world/scene/construction/belongings"
import { glass } from "#/world/scene/construction/belongings"
import { steam } from "#/world/scene/construction/belongings"
import type { OnWall } from "#/world/scene/construction/belongings"
import type { Lying } from "#/world/scene/construction/belongings"

export const ON_WALLS: Record<string, OnWall> = {
  干し網: (k) => {
    for (const i = { value: 0 }; i.value < 6; i.value++) k.box({ side: M.rope, top: null, u0: -0.4 + i.value * 0.16, y0: -0.7, v0: 0.01, u1: -0.39 + i.value * 0.16, y1: 0, v1: 0.02 })
    for (const j = { value: 0 }; j.value < 5; j.value++) k.box({ side: M.rope, top: null, u0: -0.4, y0: -0.7 + j.value * 0.16, v0: 0.01, u1: 0.42, y1: -0.69 + j.value * 0.16, v1: 0.02 })
    for (const u of [-0.25, 0.1, 0.3]) k.box({ side: fish, top: null, u0: u - 0.03, y0: -0.45, v0: 0.02, u1: u + 0.03, y1: -0.25, v1: 0.04 })
  },
  吊るした服: (k, _w, s) => [-0.3, 0.05, 0.4].forEach((u, i) => garment({ k: k, c: pick(cloth, s, i), len: 0.7 + r(s, i) * 0.3, u: u, wide: 0.28 })),
  吊るした革: (k, _w, s) => [-0.25, 0.2].forEach((u, i) => k.box({ side: i ? leather : hide, top: null, u0: u - 0.2, y0: -0.7 - r(s, i) * 0.2, v0: 0.01, u1: u + 0.2, y1: -0.04, v1: 0.03 })),
  干した皮: (k) => {
    // a hide stretched on a frame of poles, tied at the corners
    for (const su of [-1, 1]) k.box({ side: M.woodV, top: null, u0: su * 0.42 - 0.02, y0: -1.0, v0: 0.0, u1: su * 0.42 + 0.02, y1: 0.02, v1: 0.04 })
    for (const y of [0, -0.98]) k.box({ side: M.woodV, top: null, u0: -0.44, y0: y - 0.02, v0: 0.0, u1: 0.44, y1: y + 0.02, v1: 0.04 })
    k.box({ side: hide, top: null, u0: -0.36, y0: -0.9, v0: 0.04, u1: 0.36, y1: -0.08, v1: 0.05 })
  },
  吊るした薬草: (k, _w, s) => [-0.35, -0.15, 0.05, 0.25, 0.45].forEach((u, i) => bunch({ k: k, m: pick(herb, s, i), u: u, len: 0.3, n: 5, seed: s + i })),
  姿見: (k, wd) => {
    frame({ k: k, W: 0.45, H: 1.3, inside: glass, wd: wd })
    k.box({ side: colorMat(0xd8e4ea), top: null, u0: -0.12, y0: -0.9, v0: 0.035, u1: -0.04, y1: -0.3, v1: 0.04 }) // a gleam
  },
  盾の壁掛け: (k, _w, s) => {
    k.cyl({ side: M.woodDark, top: null, u: 0, v: 0, y0: -0.5, y1: 0.0, r0: 0.3, r1: 0.3, seg: 10 })
    k.box({ side: pick(cloth, s), top: null, u0: -0.04, y0: -0.48, v0: 0.0, u1: 0.04, y1: -0.02, v1: 0.32 })
    k.box({ side: M.iron, top: null, u0: -0.06, y0: -0.31, v0: 0.29, u1: 0.06, y1: -0.19, v1: 0.33 })
  },
  町の絵地図: (k, wd) => {
    frame({ k: k, W: 1.1, H: 0.75, inside: paper, wd: wd })
    k.box({ side: colorMat(0x6a8a6a), top: null, u0: -0.4, y0: -0.6, v0: 0.036, u1: -0.05, y1: -0.2, v1: 0.04 })
    k.box({ side: colorMat(0x5a7a9a), top: null, u0: 0.05, y0: -0.7, v0: 0.036, u1: 0.1, y1: -0.08, v1: 0.04 })
    k.box({ side: colorMat(0x9a6a4a), top: null, u0: 0.15, y0: -0.5, v0: 0.036, u1: 0.42, y1: -0.3, v1: 0.04 })
  },
  地図の束: (k) => {
    for (const i = { value: 0 }; i.value < 4; i.value++) k.cyl({ side: paper, top: paper, u: -0.2 + i.value * 0.12, v: 0.08, y0: -0.6, y1: -0.05, r0: 0.035, r1: 0.035, seg: 6 })
    k.box({ side: M.woodDark, top: null, u0: -0.3, y0: -0.62, v0: 0, u1: 0.3, y1: -0.58, v1: 0.16 })
  },
  斧掛け: (k) => [-0.25, 0.1].forEach((u) => tool(k, u, "axe")),
  杖掛け: (k) => {
    k.box({ side: M.woodDark, top: null, u0: -0.4, y0: -0.04, v0: 0, u1: 0.4, y1: 0, v1: 0.1 })
    for (const i = { value: 0 }; i.value < 3; i.value++)
      k.box({ side: M.woodV, top: null, u0: -0.25 + i.value * 0.25 - 0.015, y0: -1.4, v0: 0.04, u1: -0.25 + i.value * 0.25 + 0.015, y1: 0.05, v1: 0.07 })
  },
  弓掛け: (k) => {
    for (const i = { value: 0 }; i.value < 3; i.value++) {
      k.box({ side: M.woodDark, top: null, u0: -0.45, y0: -0.02 - i.value * 0.3, v0: 0, u1: 0.45, y1: 0.02 - i.value * 0.3, v1: 0.06 })
      k.box({ side: M.linen, top: null, u0: -0.43, y0: -0.07 - i.value * 0.3, v0: 0.05, u1: 0.43, y1: -0.065 - i.value * 0.3, v1: 0.055 })
    }
  },
  鉢植え: (k, wd, s) =>
    wallShelf({
      k: k,
      wd: wd,
      W: 0.8,
      things: (u, i) => {
        k.cyl({ side: clay, top: null, u: u + 0.08, v: 0.1, y0: 0.035, y1: 0.15, r0: 0.06, r1: 0.07, seg: 7 })
        k.cyl({ side: pick(herb, s, i), top: null, u: u + 0.08, v: 0.1, y0: 0.15, y1: 0.25 + r(s, i) * 0.1, r0: 0.08, r1: 0.02, seg: 6 })
        return 0.22
      },
    }),
  乳鉢: (k, wd) =>
    wallShelf({
      k: k,
      wd: wd,
      W: 0.6,
      things: (u, i) => {
        if (i === 0) {
          k.cyl({ side: M.stone, top: null, u: u + 0.1, v: 0.1, y0: 0.035, y1: 0.12, r0: 0.08, r1: 0.06, seg: 8 })
          k.box({ side: M.stoneDark, top: null, u0: u + 0.08, y0: 0.1, v0: 0.06, u1: u + 0.11, y1: 0.2, v1: 0.09 })
        } else k.cyl({ side: glass, top: null, u: u + 0.05, v: 0.1, y0: 0.035, y1: 0.17, r0: 0.04, r1: 0.03, seg: 6 })
        return i === 0 ? 0.24 : 0.12
      },
    }),
  鉋と鋸: (k) => {
    tool(k, -0.3, "saw")
    tool(k, 0.25, "plane")
    tool(k, 0.45, "chisel")
  },
  石鑿と槌: (k) => {
    tool(k, -0.2, "chisel")
    tool(k, -0.05, "chisel")
    k.box({ side: M.woodV, top: null, u0: 0.2, y0: -0.4, v0: 0.01, u1: 0.23, y1: 0, v1: 0.04 })
    k.box({ side: M.iron, top: null, u0: 0.14, y0: -0.08, v0: 0.0, u1: 0.3, y1: 0.0, v1: 0.08 })
  },
  縄の束: (k) => {
    for (const i = { value: 0 }; i.value < 3; i.value++) k.cyl({ side: M.rope, top: null, u: -0.25 + i.value * 0.25, v: 0.08, y0: -0.35, y1: -0.05, r0: 0.1, r1: 0.1, seg: 8 })
  },
  荷車の車輪: (k) => {
    for (const i = { value: 0 }; i.value < 20; i.value++) {
      const a = (i.value / 20) * Math.PI * 2
      k.box({ side: M.woodDark, top: null, u0: Math.cos(a) * 0.4 - 0.03, y0: -0.45 + Math.sin(a) * 0.4 - 0.03, v0: 0.0, u1: Math.cos(a) * 0.4 + 0.03, y1: -0.45 + Math.sin(a) * 0.4 + 0.03, v1: 0.05 })
    }
    k.box({ side: M.woodDark, top: null, u0: -0.38, y0: -0.47, v0: 0.01, u1: 0.38, y1: -0.43, v1: 0.04 })
    k.box({ side: M.woodDark, top: null, u0: -0.02, y0: -0.83, v0: 0.01, u1: 0.02, y1: -0.07, v1: 0.04 })
  },
  鋤と鍬: (k) => {
    tool(k, -0.25, "hoe")
    tool(k, 0.1, "spade")
  },
  取引の掲示板: (k, wd) => {
    frame({ k: k, W: 1.0, H: 0.7, inside: colorMat(0x9a7a52), wd: wd })
    for (const i = { value: 0 }; i.value < 6; i.value++)
      k.box({
        side: paper,
        top: null,
        u0: -0.38 + (i.value % 3) * 0.27,
        y0: -0.6 + Math.floor(i.value / 3) * 0.28,
        v0: 0.035,
        u1: -0.18 + (i.value % 3) * 0.27,
        y1: -0.42 + Math.floor(i.value / 3) * 0.28,
        v1: 0.04,
      })
  },
  ランタンの棚: (k, wd) =>
    wallShelf({
      k: k,
      wd: wd,
      W: 1.0,
      things: (u) => {
        k.box({ side: M.iron, top: glass, u0: u, y0: 0.035, v0: 0.04, u1: u + 0.12, y1: 0.22, v1: 0.16 })
        return 0.2
      },
    }),
  紙の束: (k, wd, s) =>
    wallShelf({
      k: k,
      wd: wd,
      W: 0.8,
      things: (u, i) => {
        for (const j = { value: 0 }; j.value < 4 + Math.floor(r(s, i) * 4); j.value++)
          k.box({ side: paper, top: paper, u0: u, y0: 0.035 + j.value * 0.012, v0: 0.03, u1: u + 0.2, y1: 0.045 + j.value * 0.012, v1: 0.17 })
        return 0.26
      },
    }),
  芯の束: (k, _w, s) => [-0.2, 0.0, 0.2].forEach((u, i) => bunch({ k: k, m: wax, u: u, len: 0.35, n: 6, seed: s + i })),
  煙突ぶらし: (k) => {
    k.box({ side: M.woodV, top: null, u0: -0.02, y0: -1.3, v0: 0.01, u1: 0.02, y1: 0, v1: 0.04 })
    k.cyl({ side: M.dark, top: null, u: 0, v: 0.1, y0: 0.0, y1: 0.15, r0: 0.12, r1: 0.12, seg: 8 })
    k.box({ side: M.rope, top: null, u0: 0.15, y0: -0.5, v0: 0.01, u1: 0.35, y1: -0.05, v1: 0.08 })
  },
  砥石: (k, wd) =>
    wallShelf({
      k: k,
      wd: wd,
      W: 0.5,
      things: (u, i) => {
        k.box({ side: i ? M.stoneDark : M.stone, top: null, u0: u, y0: 0.035, v0: 0.04, u1: u + 0.16, y1: 0.08, v1: 0.12 })
        return 0.2
      },
    }),
  石板の束: (k, wd) =>
    wallShelf({
      k: k,
      wd: wd,
      W: 0.6,
      things: (u) => {
        k.box({ side: slate, top: M.woodDark, u0: u, y0: 0.035, v0: 0.02, u1: u + 0.03, y1: 0.3, v1: 0.18 })
        return 0.08
      },
    }),
  天秤: (k, wd) =>
    wallShelf({
      k: k,
      wd: wd,
      W: 0.6,
      things: (u, i) => {
        if (i) return 0.6
        k.box({ side: M.iron, top: null, u0: u + 0.24, y0: 0.035, v0: 0.08, u1: u + 0.26, y1: 0.3, v1: 0.1 })
        k.box({ side: M.iron, top: null, u0: u + 0.05, y0: 0.28, v0: 0.08, u1: u + 0.45, y1: 0.3, v1: 0.1 })
        for (const du of [0.08, 0.42]) k.cyl({ side: brass, top: null, u: u + du, v: 0.09, y0: 0.08, y1: 0.1, r0: 0.07, r1: 0.07, seg: 8 })
        return 0.6
      },
    }),
  // the pot hangs over the fire on its hook (drawn with the fire)
  大鍋: () => {},
}

export const BY_USE: Record<string, readonly OnWall[]> = {
  台所: [
    // a plate rack, a row of ladles and spoons, a string of onions
    (k, wd, s) => wallShelf({ k: k, wd: wd, W: 1.0, things: (u, i) => (vessel({ k: k, u: u, v: 0.1, y: 0.035, seed: s, n: i }), 0.16) }),
    (k) => {
      k.box({ side: M.woodDark, top: null, u0: -0.4, y0: -0.04, v0: 0, u1: 0.4, y1: 0, v1: 0.05 })
      for (const i = { value: 0 }; i.value < 5; i.value++) {
        const u = -0.32 + i.value * 0.16
        k.box({ side: i.value % 2 ? M.iron : M.woodV, top: null, u0: u - 0.01, y0: -0.35, v0: 0.02, u1: u + 0.01, y1: -0.02, v1: 0.035 })
        k.cyl({ side: i.value % 2 ? M.iron : M.woodV, top: null, u: u, v: 0.04, y0: -0.4, y1: -0.34, r0: 0.035, r1: 0.035, seg: 6 })
      }
    },
    (k) => [-0.15, 0.15].forEach((u, i) => string({ k: k, m: i ? garlic : onion, u: u, n: 6 })),
    (k) => {
      // pans hung by their handles
      for (const entry of [
        [-0.25, 0.14],
        [0.15, 0.18],
      ] as const) {
        const u = entry[0]
        const rr = entry[1]

        k.box({ side: M.iron, top: null, u0: u - 0.015, y0: -0.2, v0: 0.0, u1: u + 0.015, y1: 0, v1: 0.03 })
        k.cyl({ side: M.iron, top: null, u: u, v: 0.05, y0: -0.2 - rr * 2, y1: -0.2, r0: rr, r1: rr, seg: 9 })
      }
    },
  ],
  食事: [
    (k, wd, s) => wallShelf({ k: k, wd: wd, W: 1.1, things: (u, i) => (vessel({ k: k, u: u, v: 0.1, y: 0.035, seed: s, n: i + 3 }), 0.18) }),
    (k, wd, s) => {
      // a picture of somebody's family, or a pressed flower in a frame
      frame({ k: k, W: 0.4, H: 0.5, inside: pick(cloth, s, 7), wd: wd })
      k.box({ side: paper, top: null, u0: -0.08, y0: -0.32, v0: 0.036, u1: 0.08, y1: -0.14, v1: 0.04 })
    },
    (k) => {
      // a sconce with a candle
      k.box({ side: brass, top: null, u0: -0.04, y0: -0.15, v0: 0, u1: 0.04, y1: 0, v1: 0.1 })
      candle({ k: k, u: 0, v: 0.1, y: -0.05, tall: 0.12 })
    },
    (k, wd) => {
      // the calendar of the chapel's days, its leaves turned up
      frame({ k: k, W: 0.35, H: 0.45, inside: paper, wd: wd })
      for (const i = { value: 0 }; i.value < 5; i.value++) k.box({ side: ink, top: null, u0: -0.12, y0: -0.12 - i.value * 0.06, v0: 0.036, u1: 0.1, y1: -0.11 - i.value * 0.06, v1: 0.04 })
    },
  ],
  作業場: [
    (k) => {
      // a peg board of the trade's tools
      k.box({ side: M.woodDark, top: null, u0: -0.5, y0: -0.6, v0: 0, u1: 0.5, y1: 0, v1: 0.02 })
      tool(k, -0.35, "saw")
      tool(k, 0.0, "shears")
      tool(k, 0.25, "knife")
    },
    (k, wd, s) =>
      wallShelf({
        k: k,
        wd: wd,
        W: 1.0,
        things: (u, i) => {
          if (r(s, i) > 0.5) k.box({ side: M.woodDark, top: M.iron, u0: u, y0: 0.035, v0: 0.03, u1: u + 0.2, y1: 0.12, v1: 0.17 })
          else k.cyl({ side: clay, top: null, u: u + 0.07, v: 0.1, y0: 0.035, y1: 0.18, r0: 0.06, r1: 0.05, seg: 7 })
          return 0.24
        },
      }),
    (k, _w, s) => garment({ k: k, c: pick([leather, linen], s), len: 0.8 }),
  ],
  売り場: [
    (k, wd) => {
      // the board of prices, chalked
      frame({ k: k, W: 0.7, H: 0.5, inside: slate, wd: wd })
      for (const i = { value: 0 }; i.value < 5; i.value++)
        k.box({ side: wax, top: null, u0: -0.25, y0: -0.12 - i.value * 0.07, v0: 0.036, u1: -0.25 + 0.2 + (i.value % 3) * 0.1, y1: -0.11 - i.value * 0.07, v1: 0.04 })
    },
    (k, wd, s) => wallShelf({ k: k, wd: wd, W: 1.0, things: (u, i) => (vessel({ k: k, u: u, v: 0.1, y: 0.035, seed: s, n: i + 7 }), 0.18) }),
    (k) => {
      k.box({ side: brass, top: null, u0: -0.04, y0: -0.15, v0: 0, u1: 0.04, y1: 0, v1: 0.1 })
      candle({ k: k, u: 0, v: 0.1, y: -0.05, tall: 0.12 })
    },
  ],
  土間: [(k, _w, s) => [-0.25, 0.1].forEach((u, i) => garment({ k: k, c: pick(cloth, s, i), len: 0.85, u: u, wide: 0.3 })), (k) => [-0.2, 0.2].forEach((u, i) => tool(k, u, i ? "broom" : "spade"))],
  貯蔵: [
    (k) => [-0.25, 0.0, 0.25].forEach((u, i) => string({ k: k, m: i === 1 ? garlic : onion, u: u, n: 7 })),
    (k) => {
      k.box({ side: M.woodDark, top: null, u0: -0.3, y0: -0.05, v0: 0, u1: 0.3, y1: 0, v1: 0.1 })
      k.box({ side: meat, top: null, u0: -0.08, y0: -0.45, v0: 0.02, u1: 0.08, y1: -0.05, v1: 0.12 })
    },
  ],
}

BY_USE["住まい"] = BY_USE["食事"]
BY_USE["客室"] = BY_USE["食事"]

export const LYING: [RegExp, Lying][] = [
  [/外套|泥除け/, (k, s) => k.box({ side: pick(cloth, s), top: null, u0: -0.25, y0: 0, v0: -0.15, u1: 0.25, y1: 0.06, v1: 0.18 })],
  [/前掛け/, (k) => k.box({ side: linen, top: null, u0: -0.18, y0: 0, v0: -0.12, u1: 0.18, y1: 0.03, v1: 0.14 })],
  [/膝掛け/, (k, s) => k.box({ side: pick(cloth, s), top: null, u0: -0.28, y0: 0, v0: -0.2, u1: 0.28, y1: 0.05, v1: 0.2 })],
  [/靴下/, (k, s) => [-0.08, 0.08].forEach((u) => k.box({ side: pick(cloth, s), top: null, u0: u - 0.04, y0: 0, v0: -0.1, u1: u + 0.04, y1: 0.03, v1: 0.1 }))],
  [/手袋/, (k) => [-0.07, 0.07].forEach((u) => k.box({ side: leather, top: null, u0: u - 0.05, y0: 0, v0: -0.08, u1: u + 0.05, y1: 0.03, v1: 0.08 }))],
  [
    /帽子/,
    (k, s) => (
      k.cyl({ side: pick(cloth, s), top: null, u: 0, v: 0, y0: 0, y1: 0.02, r0: 0.16, r1: 0.16, seg: 8 }),
      k.cyl({ side: pick(cloth, s), top: null, u: 0, v: 0, y0: 0.02, y1: 0.12, r0: 0.09, r1: 0.08, seg: 8 })
    ),
  ],
  [/首巻き|型紙|布/, (k, s) => k.box({ side: pick(cloth, s), top: null, u0: -0.2, y0: 0, v0: -0.06, u1: 0.2, y1: 0.025, v1: 0.06 })],
  [/長靴/, (k, s) => shoes({ k: k, u: -0.15, v: 0, m: leather, tall: true, pairs: 1 + Math.floor(r(s, 1) * 2) })],
  [/靴|室内履き|木靴/, (k, _s, n) => shoes({ k: k, u: -0.06, v: 0, m: /木靴/.test(n) ? M.wood : leather })],
  [/手紙|書き付け|議事録|帳面|交代表|札|手習い/, (k, s) => papers({ k: k, u: 0, v: 0, y: 0, seed: s })],
  [/本|宿帳|帳簿/, (k, s) => book({ k: k, u: 0, v: 0, y: 0, seed: s, open: true })],
  [
    /石板/,
    (k) => (
      k.box({ side: M.woodDark, top: null, u0: -0.15, y0: 0, v0: -0.11, u1: 0.15, y1: 0.02, v1: 0.11 }),
      k.box({ side: slate, top: null, u0: -0.13, y0: 0.02, v0: -0.09, u1: 0.13, y1: 0.025, v1: 0.09 })
    ),
  ],
  [/地図/, (k) => (papers({ k: k, u: 0, v: 0, y: 0, seed: 3, n: 1 }), k.box({ side: colorMat(0x6a8a6a), top: null, u0: -0.05, y0: 0.006, v0: -0.06, u1: 0.04, y1: 0.008, v1: 0.05 }))],
  [/蝋燭/, (k) => candle({ k: k, u: 0, v: 0, y: 0, tall: 0.2 })],
  [/杯|茶|椀/, (k, s) => [-0.1, 0.1].forEach((u, i) => k.cyl({ side: pick(glaze, s, i), top: steam, u: u, v: 0, y0: 0, y1: 0.09, r0: 0.04, r1: 0.05, seg: 7 }))],
  [/皿/, (k, s) => [0, 1, 2].forEach((i) => k.cyl({ side: pick(glaze, s, i), top: null, u: (i - 1) * 0.04, v: 0, y0: i * 0.02, y1: i * 0.02 + 0.02, r0: 0.1, r1: 0.11, seg: 8 }))],
  [
    /鍋|膠|ろう/,
    (k) => (
      k.cyl({ side: M.iron, top: M.dark, u: 0, v: 0, y0: 0, y1: 0.16, r0: 0.14, r1: 0.15, seg: 9 }),
      k.box({ side: M.iron, top: null, u0: 0.14, y0: 0.12, v0: -0.015, u1: 0.28, y1: 0.14, v1: 0.015 })
    ),
  ],
  [/壺|甕/, (k) => k.cyl({ side: clay, top: M.woodDark, u: 0, v: 0, y0: 0, y1: 0.26, r0: 0.1, r1: 0.08, seg: 8 })],
  [/瓶/, (k) => k.cyl({ side: glass, top: null, u: 0, v: 0, y0: 0, y1: 0.16, r0: 0.04, r1: 0.025, seg: 6 })],
  [/パン/, (k) => [-0.08, 0.1].forEach((u) => k.cyl({ side: bread, top: bread, u: u, v: 0, y0: 0, y1: 0.07, r0: 0.08, r1: 0.06, seg: 7 }))],
  [/チーズ/, (k) => k.cyl({ side: linen, top: cheese, u: 0, v: 0, y0: 0, y1: 0.12, r0: 0.13, r1: 0.13, seg: 8 })],
  [/林檎|果/, (k, s) => basket({ k: k, u: 0, v: 0, seed: s, fill: apple })],
  [/蕪|籠|笊/, (k, s, n) => basket({ k: k, u: 0, v: 0, seed: s, fill: /蕪/.test(n) ? garlic : /洗濯/.test(n) ? linen : undefined })],
  [/卵/, (k, s) => basket({ k: k, u: 0, v: 0, seed: s, fill: garlic })],
  [/魚/, (k) => [-0.08, 0.06].forEach((u) => k.box({ side: fish, top: null, u0: u - 0.03, y0: 0, v0: -0.12, u1: u + 0.03, y1: 0.04, v1: 0.12 }))],
  [/薬草|葡萄|玉ねぎ|花冠/, (k, s) => [-0.1, 0, 0.1].forEach((u, i) => k.box({ side: pick(herb, s, i), top: null, u0: u - 0.04, y0: 0, v0: -0.1, u1: u + 0.04, y1: 0.03, v1: 0.1 }))],
  [/肉/, (k) => k.box({ side: meat, top: null, u0: -0.1, y0: 0, v0: -0.12, u1: 0.1, y1: 0.12, v1: 0.12 })],
  [
    /結晶/,
    (k) => (
      k.box({ side: linen, top: null, u0: -0.12, y0: 0, v0: -0.08, u1: 0.12, y1: 0.01, v1: 0.08 }),
      k.cyl({ side: crystal, top: null, u: 0.03, v: 0, y0: 0.01, y1: 0.07, r0: 0.025, r1: 0.005, seg: 5 })
    ),
  ],
  [/鍵/, (k) => k.box({ side: M.iron, top: null, u0: -0.06, y0: 0, v0: -0.03, u1: 0.06, y1: 0.02, v1: 0.03 })],
  [
    /斧/,
    (k) => (k.box({ side: M.woodV, top: null, u0: -0.3, y0: 0, v0: -0.02, u1: 0.2, y1: 0.04, v1: 0.02 }), k.box({ side: M.iron, top: null, u0: 0.18, y0: 0, v0: -0.08, u1: 0.26, y1: 0.04, v1: 0.06 })),
  ],
  [
    /包丁|鋏|鑿|針|ペン|筆/,
    (k) => (
      k.box({ side: M.iron, top: null, u0: -0.1, y0: 0, v0: -0.01, u1: 0.06, y1: 0.012, v1: 0.01 }),
      k.box({ side: M.woodDark, top: null, u0: 0.06, y0: 0, v0: -0.015, u1: 0.14, y1: 0.02, v1: 0.015 })
    ),
  ],
  [/剣|弓|槍|杖/, (k) => k.box({ side: M.woodV, top: null, u0: -0.35, y0: 0, v0: -0.025, u1: 0.35, y1: 0.04, v1: 0.025 })],
  [
    /馬/,
    (k) => (
      k.box({ side: M.wood, top: null, u0: -0.1, y0: 0.08, v0: -0.04, u1: 0.1, y1: 0.16, v1: 0.04 }),
      k.box({ side: M.wood, top: null, u0: 0.06, y0: 0.12, v0: -0.03, u1: 0.12, y1: 0.24, v1: 0.03 }),
      k.legs({ m: M.woodDark, h: 0.08, t: 0.02, inset: 0, W: 0.2, D: 0.08 })
    ),
  ],
  [/兜|胸当て|蹄鉄|火屋|呼び子|ランタン/, (k) => k.cyl({ side: M.iron, top: null, u: 0, v: 0, y0: 0, y1: 0.1, r0: 0.1, r1: 0.08, seg: 7 })],
  [/縄|紐|測り縄/, (k) => k.cyl({ side: M.rope, top: null, u: 0, v: 0, y0: 0, y1: 0.06, r0: 0.13, r1: 0.13, seg: 8 })],
  [/毛糸|糸巻き|編み/, (k, s) => [0, 1].forEach((i) => k.cyl({ side: pick(cloth, s, i), top: pick(cloth, s, i), u: (i - 0.5) * 0.14, v: 0, y0: 0, y1: 0.1, r0: 0.06, r1: 0.05, seg: 6 }))],
  [
    /袋|荷/,
    (k) => (
      k.cyl({ side: M.sack, top: M.sack, u: 0, v: 0, y0: 0, y1: 0.3, r0: 0.16, r1: 0.12, seg: 7 }),
      k.cyl({ side: M.rope, top: null, u: 0, v: 0, y0: 0.26, y1: 0.29, r0: 0.07, r1: 0.07, seg: 6 })
    ),
  ],
  [/板|木切れ|木の/, (k) => k.box({ side: M.wood, top: null, u0: -0.25, y0: 0, v0: -0.06, u1: 0.25, y1: 0.03, v1: 0.06 })],
  [/器|鉢|かけら/, (k, s) => [-0.12, 0.05, 0.18].forEach((u, i) => k.cyl({ side: pick(glaze, s, i), top: null, u: u, v: 0, y0: 0, y1: 0.08, r0: 0.04, r1: 0.06, seg: 7 }))],
  [
    /箱/,
    (k) => (
      k.box({ side: M.woodDark, top: M.wood, u0: -0.12, y0: 0, v0: -0.08, u1: 0.12, y1: 0.12, v1: 0.08 }),
      k.box({ side: brass, top: null, u0: -0.03, y0: 0.12, v0: -0.01, u1: 0.03, y1: 0.125, v1: 0.01 })
    ),
  ],
  [/火掻き|火鉢|熾火|炉/, (k) => k.box({ side: M.iron, top: null, u0: -0.02, y0: 0, v0: -0.25, u1: 0.02, y1: 0.03, v1: 0.25 })],
  [/冬毛|皮|毛/, (k) => k.box({ side: hide, top: null, u0: -0.22, y0: 0, v0: -0.16, u1: 0.22, y1: 0.05, v1: 0.16 })],
  [/桶|手桶|天秤棒/, (k) => k.cyl({ side: M.woodV, top: null, u: 0, v: 0, y0: 0, y1: 0.22, r0: 0.12, r1: 0.14, seg: 8 })],
]
