import { createGroundCanvas } from "#/world/scene/runtime/create-ground-canvas"
import { createGroundSurface } from "#/world/scene/runtime/create-ground-surface"
import { createSceneWater } from "#/world/scene/runtime/create-scene-water"
import { lap } from "#/world/lap"
import type { Scene } from "three"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"

type Props = Readonly<{ scene: Scene; world: SceneDefinition; ground: PixelBuffer; progress(text: string): void; tick(): Promise<unknown>; resources: CleanupStack }>

/** 地面と水を建物より先に組み立て、屋内ではミニマップを残して両方の面を隠す。 */
export async function createSceneTerrain(props: Props) {
  const groundCanvas = createGroundCanvas(props.ground, props.world)
  lap("scene: ground")
  props.progress("街を建てています…")
  await props.tick()
  const terrain = createGroundSurface(props.ground, props.resources)
  props.scene.add(terrain)
  const water = createSceneWater(props.resources)
  props.scene.add(water)
  if (props.world.indoor) {
    terrain.visible = false
    water.visible = false
  }
  return { groundCanvas, wm: water.material, terrain }
}
