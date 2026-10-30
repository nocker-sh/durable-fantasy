import { workTableSections } from "../../town/work-table"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "./materials"
import type { Furniture } from "#/world/town/interiors"

/** An authored table uses the room's floor and already projected physical dimensions. */
export function workTable(builder: GB, furniture: Furniture, floor: number) {
  const xSource = furniture,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d,
    surface = xSource.workSurface
  if (!surface) throw new Error("A measured table needs work surface dimensions")
  for (const section of workTableSections({ surface: surface, x: x, z: z, width: w, depth: d, floor: floor })) {
    const top = section.part === "top"
    builder.box({ side: top ? M.wood : M.woodDark, top: top ? M.wood : null, x0: section.x0, y0: section.y0, z0: section.z0, x1: section.x1, y1: section.y1, z1: section.z1, repeat: 2 })
  }
}
