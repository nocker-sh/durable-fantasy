import { getChairSections } from "#/world/town/get-chair-sections"
import { M } from "#/world/scene/construction/materials"
import type { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { Furniture } from "#/world/town/interiors"
const finishes = {
  leg: { side: M.woodDark, top: null, detail: 1 },
  seat: { side: M.wood, top: M.woodDark, detail: 2 },
  board: { side: M.wood, top: M.woodDark, detail: 1 },
  bearer: { side: M.woodDark, top: M.woodDark, detail: 1 },
  back: { side: M.woodDark, top: M.woodDark, detail: 1 },
}

/** Materials and detailing remain renderer-owned; solid geometry is shared with the chair's physical checks. */
export function chair(gb: GB, furniture: Furniture, floor: number) {
  const seat = furniture.seat ?? {
    width: Math.min(furniture.w, furniture.d) * 0.9,
    depth: Math.min(furniture.w, furniture.d) * 0.9,
    height: 0.48,
    backHeight: 0.95,
    boardThickness: 0.06,
    legWidth: 0.06,
  }
  const sections = getChairSections({
    seat,
    at: [furniture.x, furniture.z],
    floor,
    legInset: furniture.seat ? 0 : 0.02,
    backThickness: furniture.seat ? seat.legWidth : 0.05,
    hasBack: !/揺り/.test(furniture.name ?? ""),
  })
  for (const section of sections) {
    const finish = finishes[section.part]
    gb.box({ side: finish.side, top: finish.top, x0: section.x0, y0: section.y0, z0: section.z0, x1: section.x1, y1: section.y1, z1: section.z1, repeat: finish.detail })
  }
}
