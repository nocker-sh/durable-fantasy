import type { WorkSurfaceSpec } from "./room-fixtures"

export type WorkTableSection = {
  part: "top" | "leg"
  x0: number
  y0: number
  z0: number
  x1: number
  y1: number
  z1: number
}

/** Physical top and legs, shared by room rendering and clearance checks. */
export function workTableSections(inputProps: { surface: WorkSurfaceSpec; x: number; z: number; width: number; depth: number; floor?: number }): WorkTableSection[] {
  const surface = inputProps.surface
  const x = inputProps.x
  const z = inputProps.z
  const width = inputProps.width
  const depth = inputProps.depth
  const floor = inputProps.floor === undefined ? 0 : inputProps.floor

  const underside = floor + surface.height - surface.thickness
  const sections: WorkTableSection[] = [{ part: "top", x0: x - width / 2, y0: underside, z0: z - depth / 2, x1: x + width / 2, y1: floor + surface.height, z1: z + depth / 2 }]
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const cx = x + sx * (width / 2 - surface.legInset)
      const cz = z + sz * (depth / 2 - surface.legInset)
      const half = surface.legWidth / 2
      sections.push({ part: "leg", x0: cx - half, y0: floor, z0: cz - half, x1: cx + half, y1: underside, z1: cz + half })
    }
  return sections
}
