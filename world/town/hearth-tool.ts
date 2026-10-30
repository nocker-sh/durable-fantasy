import { rectangleFace, type RectangleSide } from "../../lib/engine/rectangle-face"
import type { Rectangle } from "../../lib/engine/rectangle-subtraction"
import type { HearthSpec } from "#/world/town/hearth-types"

/** Necessary planar insertion paths to both rear sides, with blade clearance at the mouth. */
export function hearthToolPaths(inputProps: { bounds: Rectangle; front: RectangleSide; spec: HearthSpec; grip: readonly [number, number]; bladeWidth: number; length: number }) {
  const bounds = inputProps.bounds
  const front = inputProps.front
  const spec = inputProps.spec
  const grip = inputProps.grip
  const bladeWidth = inputProps.bladeWidth
  const length = inputProps.length

  const face = rectangleFace({ x: (bounds.x0 + bounds.x1) / 2, z: (bounds.z0 + bounds.z1) / 2, width: bounds.x1 - bounds.x0, depth: bounds.z1 - bounds.z0, side: front }),
    nxState = face.outward,
    nx = nxState[0],
    nz = nxState[1]
  const dx = grip[0] - face.point[0],
    dz = grip[1] - face.point[1],
    outside = dx * nx + dz * nz,
    across = -dx * nz + dz * nx
  if (![...grip, bladeWidth, length].every(Number.isFinite) || outside <= 0 || bladeWidth <= 0 || bladeWidth >= spec.openingWidth || length <= 0)
    throw new Error("Invalid maintenance insertion dimensions")
  const half = (spec.openingWidth - bladeWidth) / 2
  return [-half, half].map((offset) => {
    const u = spec.openingOffset + offset
    const target: readonly [number, number] = [face.point[0] - nz * u - nx * spec.chamberDepth, face.point[1] + nx * u - nz * spec.chamberDepth]
    const crossing = across + ((u - across) * outside) / (outside + spec.chamberDepth)
    if (Math.abs(crossing - spec.openingOffset) + bladeWidth / 2 > spec.openingWidth / 2 + 1e-9) throw new Error("Maintenance tool path clips the firebox opening")
    if (Math.hypot(target[0] - grip[0], target[1] - grip[1]) > length + 1e-9) throw new Error("Maintenance tool cannot reach the firebox back")
    return { grip, target }
  })
}
