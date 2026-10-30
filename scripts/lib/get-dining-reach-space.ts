import type { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
type Geometry = Exclude<ReturnType<typeof getDiningSeatGeometry>, Error>

/** Keep every dish and the actual tabletop/legs in one room-space obstacle set for both movement stages. */
export function getDiningReachSpace(geometry: Geometry, boxes: readonly LayoutBox[], origin: readonly [number, number]) {
  const top = geometry.sections.find((section) => section.part === "top")
  if (!top) return new Error("Dining reach has no table surface")
  const table = geometry.sections.map((section) => ({ x0: section.x0, x1: section.x1, z0: section.z0, z1: section.z1, bottom: section.y0, top: section.y1 }))
  const tableware = boxes.map((box) => ({
    x0: origin[0] + box.origin[0],
    x1: origin[0] + box.origin[0] + box.size[0],
    z0: origin[1] + box.origin[2],
    z1: origin[1] + box.origin[2] + box.size[2],
    bottom: top.y1,
    top: top.y1 + box.size[1],
  }))

  return { height: top.y1, obstacles: [...table, ...tableware] }
}
