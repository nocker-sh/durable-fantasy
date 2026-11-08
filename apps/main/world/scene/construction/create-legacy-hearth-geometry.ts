import { HEARTH_COAL } from "#/world/scene/construction/hearth-materials"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { Furniture } from "#/world/town/interiors"
type Props = { furniture: Furniture; floor: number; height: number }

/** Retain the existing fitted-room hearth until that room has an authored chamber and shaft. */
export function createLegacyHearthGeometry(props: Props) {
  const f = props.furniture,
    x = f.x,
    z = f.z,
    w = f.w,
    d = f.d,
    y0 = props.floor,
    gb = new GB()
  const face = rectangleFace({ x: x, z: z, width: w, depth: d, side: f.hearthFront ?? "e" }),
    nx = face.outward[0],
    nz = face.outward[1]
  gb.box({ side: M.stoneDark, top: M.stone, x0: x - w / 2, y0: y0, z0: z - d / 2, x1: x + w / 2, y1: y0 + 0.9, z1: z + d / 2, repeat: 4 })
  const overX = f.hearthFront ? 0 : 0.05,
    overZ = f.hearthFront ? 0 : 0.1
  gb.box({ side: M.stone, top: M.stoneDark, x0: x - w / 2 - overX, y0: y0 + 0.9, z0: z - d / 2 - overZ, x1: x + w / 2 + overX, y1: y0 + 1.05, z1: z + d / 2 + overZ, repeat: 4 })
  gb.box({ side: M.stone, top: M.stone, x0: x - w / 2, y0: y0 + 1.05, z0: z - d / 3, x1: x + w / 2 - 0.15, y1: y0 + props.height, z1: z + d / 3, repeat: 4 })
  const point = (u: number, n: number) => [face.point[0] - nz * u + nx * n, face.point[1] + nx * u + nz * n]
  const opening = (inputProps: { half: number; bottom: number; top: number; inset: number; outset: number; material: THREE.Material }) => {
    const half = inputProps.half
    const bottom = inputProps.bottom
    const top = inputProps.top
    const inset = inputProps.inset
    const outset = inputProps.outset
    const material = inputProps.material

    const a = point(-half, inset),
      b = point(half, outset)
    gb.box({ side: material, top: null, x0: Math.min(a[0], b[0]), y0: bottom, z0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: top, z1: Math.max(a[1], b[1]), repeat: 1 })
  }
  opening({ half: face.span / 3, bottom: y0 + 0.08, top: y0 + 0.7, inset: -0.02, outset: 0.01, material: M.dark })
  opening({ half: face.span / 4, bottom: y0 + 0.08, top: y0 + 0.28, inset: -0.01, outset: 0.02, material: HEARTH_COAL })

  return gb.build()
}
