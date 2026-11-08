import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { SceneOptions } from "#/world/scene/runtime/scene-options"

export type SceneBuildProps = { map: string; progress: (text: string) => void; ground: PixelBuffer; options: SceneOptions }
