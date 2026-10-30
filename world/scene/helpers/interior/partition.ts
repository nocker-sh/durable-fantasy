import { INTERIOR_CLOTH as cloth } from "#/world/scene/construction/interior-cloth-materials"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

/** A partition inside the room: a plastered wall (kept low, as the room is seen into from above), a plank half wall, or a curtain on a rod. */
export function partition(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const xSource = f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  const x0State = [x - w / 2, z - d / 2, x + w / 2, z + d / 2],
    x0 = x0State[0],
    z0 = x0State[1],
    x1 = x0State[2],
    z1 = x0State[3]
  if (f.kind === "partition") {
    gb.box({ side: M.plaster, top: M.woodDark, x0: x0, y0: y0, z0: z0, x1: x1, y1: y0 + 1.5, z1: z1, repeat: 2 })
    gb.box({ side: M.woodDark, top: null, x0: x0 - 0.01, y0: y0, z0: z0 - 0.01, x1: x1 + 0.01, y1: y0 + 0.2, z1: z1 + 0.01, repeat: 2 })
    gb.box({ side: M.woodDark, top: M.woodDark, x0: x0 - 0.02, y0: y0 + 1.5, z0: z0 - 0.02, x1: x1 + 0.02, y1: y0 + 1.58, z1: z1 + 0.02, repeat: 2 })
  } else if (f.kind === "lowwall") {
    gb.box({ side: M.woodV, top: M.woodDark, x0: x0, y0: y0, z0: z0, x1: x1, y1: y0 + 0.9, z1: z1, repeat: 2 })
    gb.box({ side: M.woodDark, top: M.wood, x0: x0 - 0.03, y0: y0 + 0.9, z0: z0 - 0.03, x1: x1 + 0.03, y1: y0 + 0.96, z1: z1 + 0.03, repeat: 2 })
  } else {
    // a curtain: the rod at the top, the cloth hanging in folds to just above the floor
    const along = w >= d
    gb.box({ side: M.woodDark, top: null, x0: x0, y0: y0 + 1.85, z0: z0 + (along ? d / 2 - 0.02 : 0), x1: x1, y1: y0 + 1.9, z1: z1 - (along ? d / 2 - 0.02 : 0), repeat: 1 })
    const len = along ? w : d,
      folds = Math.max(2, Math.round(len / 0.25))
    for (const k = { value: 0 }; k.value < folds; k.value++) {
      const a = (along ? x0 : z0) + (k.value / folds) * len,
        b = a + len / folds
      const off = k.value % 2 ? 0.03 : -0.03
      if (along) gb.box({ side: cloth[(k.value % 2) + 0], top: null, x0: a, y0: y0 + 0.08, z0: z + off - 0.02, x1: b, y1: y0 + 1.85, z1: z + off + 0.02, repeat: 1 })
      else gb.box({ side: cloth[(k.value % 2) + 0], top: null, x0: x + off - 0.02, y0: y0 + 0.08, z0: a, x1: x + off + 0.02, y1: y0 + 1.85, z1: b, repeat: 1 })
    }
  }
  root.add(gb.build())
}
