import { INTERIORS } from "#/world/town/interiors"
import { MAP_SCENES } from "#/world/scene/runtime/definitions"
import { paintInteriorMinimap } from "#/world/scene/runtime/paint-interior-minimap"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"

/** 地面の画素をミニマップへ渡し、屋内だけをその部屋の床と家具の図へ置き換える。 */
export function createGroundCanvas(ground: PixelBuffer, world: SceneDefinition): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = ground.w
  canvas.height = ground.h
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas 2D context unavailable")
  context.putImageData(new ImageData(ground.data, ground.w, ground.h), 0, 0)
  if (world.indoor) {
    const interior = INTERIORS.find((entry) => MAP_SCENES[entry.id] === world)
    if (!interior) throw new Error("Missing indoor minimap definition")
    paintInteriorMinimap(context, ground, interior)
  }
  return canvas
}
