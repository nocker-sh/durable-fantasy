import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const wool = colorMat(0xd8d0c0)
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

export function woolSacks(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  for (const entry of [
    [-0.2, 0],
    [0.2, 0.05],
    [0, 0.25],
  ]) {
    const dx = entry[0]
    const dz = entry[1]
    gb.cyl({ side: wool, top: wool, centerX: x + dx, centerZ: z + dz, fromY: y, toY: y + 0.4, fromRadius: 0.2, toRadius: 0.17, segments: 7, repeat: 1 })
  }
  blockCircle(x, z, 0.4)
}
