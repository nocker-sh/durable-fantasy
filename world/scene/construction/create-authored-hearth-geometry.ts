import { HEARTH_COAL } from "#/world/scene/construction/hearth-materials"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { getHearthRenderParts } from "#/world/town/get-hearth-render-parts"
import { flueWalls } from "#/world/town/flue-walls"
import type { Furniture } from "#/world/town/interiors"
import type { FlueSection } from "#/world/town/floorplan/types"
type Props = { furniture: Furniture; floor: number; height: number; shaft: FlueSection }

/** Shared firebox and smoke voids drive the same masonry and the cooking plate; no extra slab fills the chamber. */
export function createAuthoredHearthGeometry(props: Props) {
  const f = props.furniture,
    shaft = props.shaft,
    gb = new GB()
  if (!f.hearth || !f.hearthFront) return new Error("Authored hearth has no complete chamber and flue section")
  if (f.hearth.height >= props.height) return new Error("Hearth body leaves no vertical flue below the ceiling")
  const parts = getHearthRenderParts({
    bounds: { x0: f.x - f.w / 2, x1: f.x + f.w / 2, z0: f.z - f.d / 2, z1: f.z + f.d / 2 },
    front: f.hearthFront,
    hearth: f.hearth,
    shaft,
    bottom: props.floor,
    top: f.cookingTop ?? null,
  })
  if (parts instanceof Error) return parts
  for (const part of parts.masonry) gb.box({ side: M.stoneDark, top: M.stone, x0: part.x0, y0: part.bottom, z0: part.z0, x1: part.x1, y1: part.top, z1: part.z1, repeat: 4, bottom: true })
  if (parts.plate) {
    const part = parts.plate
    gb.box({ side: M.iron, top: M.iron, x0: part.x0, y0: part.bottom, z0: part.z0, x1: part.x1, y1: part.top, z1: part.z1, repeat: 4, bottom: true })
  }
  for (const part of flueWalls(shaft, shaft.wallThickness).walls)
    gb.box({ side: M.stone, top: M.stone, x0: part.x0, y0: props.floor + f.hearth.height, z0: part.z0, x1: part.x1, y1: props.floor + props.height, z1: part.z1, repeat: 4, bottom: true })
  const c = parts.chamber,
    cx = (c.x0 + c.x1) / 2,
    cz = (c.z0 + c.z1) / 2,
    cw = (c.x1 - c.x0) * 0.6,
    cd = (c.z1 - c.z0) * 0.6
  gb.box({ side: HEARTH_COAL, top: HEARTH_COAL, x0: cx - cw / 2, y0: c.bottom, z0: cz - cd / 2, x1: cx + cw / 2, y1: c.bottom + (c.top - c.bottom) * 0.18, z1: cz + cd / 2, repeat: 1 })

  return gb.build()
}
