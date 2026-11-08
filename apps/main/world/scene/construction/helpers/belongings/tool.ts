import { Kit } from "#/world/scene/construction/kit"
import { M } from "#/world/scene/construction/materials"

export function tool(k: Kit, u: number, kind: "axe" | "saw" | "plane" | "chisel" | "hoe" | "spade" | "shears" | "broom" | "knife") {
  // hung on two pegs: the handle down the wall, its iron at the top
  const h = kind === "hoe" || kind === "spade" || kind === "broom" ? 1.2 : 0.5
  if (kind === "saw") {
    k.box({ side: M.iron, top: null, u0: u - 0.25, y0: -0.18, v0: 0.01, u1: u + 0.2, y1: -0.05, v1: 0.02 })
    k.box({ side: M.woodDark, top: null, u0: u + 0.2, y0: -0.17, v0: 0.0, u1: u + 0.3, y1: -0.04, v1: 0.035 })
    return
  }
  if (kind === "plane") {
    k.box({ side: M.wood, top: M.woodDark, u0: u - 0.13, y0: -0.1, v0: 0.0, u1: u + 0.13, y1: 0, v1: 0.08 })
    k.box({ side: M.iron, top: null, u0: u - 0.02, y0: -0.02, v0: 0.02, u1: u + 0.02, y1: 0.02, v1: 0.06 })
    return
  }
  if (kind === "shears") {
    for (const s of [-1, 1]) k.box({ side: M.iron, top: null, u0: u + s * 0.02 - 0.01, y0: -0.3, v0: 0.01, u1: u + s * 0.02 + 0.01, y1: 0, v1: 0.03 })
    return
  }
  k.box({ side: M.woodV, top: null, u0: u - 0.015, y0: -h, v0: 0.01, u1: u + 0.015, y1: 0, v1: 0.04 })
  if (kind === "axe") k.box({ side: M.iron, top: null, u0: u - 0.02, y0: -0.12, v0: 0.0, u1: u + 0.12, y1: 0, v1: 0.05 })
  else if (kind === "hoe") k.box({ side: M.iron, top: null, u0: u - 0.09, y0: -0.06, v0: 0.0, u1: u + 0.09, y1: 0, v1: 0.12 })
  else if (kind === "spade") k.box({ side: M.iron, top: null, u0: u - 0.09, y0: -h - 0.25, v0: 0.0, u1: u + 0.09, y1: -h, v1: 0.03 })
  else if (kind === "broom") k.box({ side: M.hay, top: null, u0: u - 0.1, y0: -h - 0.35, v0: 0.0, u1: u + 0.1, y1: -h, v1: 0.06 })
  else if (kind === "chisel") k.box({ side: M.iron, top: null, u0: u - 0.01, y0: -h - 0.12, v0: 0.01, u1: u + 0.01, y1: -h, v1: 0.03 })
  else k.box({ side: M.iron, top: null, u0: u - 0.015, y0: -h - 0.18, v0: 0.015, u1: u + 0.02, y1: -h, v1: 0.025 })
}
