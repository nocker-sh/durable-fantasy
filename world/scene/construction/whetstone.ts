import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "./materials"
import type { Furniture } from "#/world/town/interiors"

/** A fixed wet sharpening stone with a catch tray, not a powered grinding wheel. */
export function whetstone(furniture: Furniture, floorY: number): THREE.Group {
  const xSource = furniture,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d,
    frame = new GB()
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      frame.box({
        side: M.woodDark,
        top: M.wood,
        x0: x + sx * w * 0.35 - 0.035,
        y0: floorY,
        z0: z + sz * d * 0.3 - 0.035,
        x1: x + sx * w * 0.35 + 0.035,
        y1: floorY + 0.62,
        z1: z + sz * d * 0.3 + 0.035,
      })
  frame.box({ side: M.woodV, top: M.wood, x0: x - w * 0.4, y0: floorY + 0.14, z0: z - d * 0.3, x1: x + w * 0.4, y1: floorY + 0.19, z1: z + d * 0.3 })
  frame.box({ side: M.wood, top: M.wood, x0: x - w * 0.43, y0: floorY + 0.58, z0: z - d * 0.4, x1: x + w * 0.43, y1: floorY + 0.63, z1: z + d * 0.4 })
  frame.box({ side: M.woodDark, top: M.woodDark, x0: x - w * 0.4, y0: floorY + 0.63, z0: z - d * 0.37, x1: x + w * 0.4, y1: floorY + 0.645, z1: z + d * 0.37 })
  for (const side of [-1, 1]) {
    frame.box({ side: M.wood, top: M.wood, x0: x - w * 0.43, y0: floorY + 0.63, z0: z + side * d * 0.37 - 0.02, x1: x + w * 0.43, y1: floorY + 0.68, z1: z + side * d * 0.37 + 0.02 })
    frame.box({ side: M.wood, top: M.wood, x0: x + side * w * 0.4 - 0.02, y0: floorY + 0.63, z0: z - d * 0.37, x1: x + side * w * 0.4 + 0.02, y1: floorY + 0.68, z1: z + d * 0.37 })
  }
  const root = frame.build()
  root.name = "whetstone"
  const stones = new THREE.Group()
  stones.name = "sharpening-stone"
  const alongX = w >= d,
    stoneW = w * (alongX ? 0.64 : 0.14),
    stoneD = d * (alongX ? 0.14 : 0.64)
  const grades = [
    { name: "coarse-stone", top: M.stoneDark },
    { name: "medium-stone", top: M.stone },
    { name: "finishing-stone", top: M.ashlar },
  ]
  for (const entry of grades.entries()) {
    const index = entry[0]
    const grade = entry[1]

    const stone = new GB(),
      offset = (index - 1) * 0.2
    const sx = x + (alongX ? 0 : offset * w),
      sz = z + (alongX ? offset * d : 0)
    stone.box({ side: M.stoneDark, top: grade.top, x0: sx - stoneW / 2, y0: floorY + 0.645, z0: sz - stoneD / 2, x1: sx + stoneW / 2, y1: floorY + 0.735, z1: sz + stoneD / 2 })
    const block = stone.build()
    block.name = grade.name
    stones.add(block)
  }
  root.add(stones)
  return root
}
