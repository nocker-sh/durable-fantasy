import { N } from "#/world/scene/world"
import type { Interior } from "#/world/town/interiors"

type Canvas = Pick<CanvasRenderingContext2D, "fillStyle" | "fillRect">
type GroundSize = Readonly<{ w: number; h: number }>

/** 屋内は歩く床と占有する家具だけを描き、屋外の地面の絵を残さない。 */
export function paintInteriorMinimap(context: Canvas, size: GroundSize, interior: Pick<Interior, "x0" | "x1" | "z0" | "z1" | "furniture">): void {
  context.fillStyle = "#0c0a10"
  context.fillRect(0, 0, size.w, size.h)
  const scale = size.w / N
  context.fillStyle = "#6a4a32"
  context.fillRect(interior.x0 * scale, interior.z0 * scale, (interior.x1 - interior.x0) * scale, (interior.z1 - interior.z0) * scale)
  context.fillStyle = "#3a2618"
  for (const furniture of interior.furniture) {
    if (furniture.solid) context.fillRect((furniture.x - furniture.w / 2) * scale, (furniture.z - furniture.d / 2) * scale, furniture.w * scale, furniture.d * scale)
  }
}
