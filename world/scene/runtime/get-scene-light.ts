import { daylight } from "#/world/core/daylight"
import { dusk } from "#/world/core/dusk"
import { mixSceneLight } from "#/world/scene/runtime/mix-scene-light"
import { SCENE_LIGHT_PALETTES } from "#/world/scene/runtime/scene-light-palettes"
import type { SceneLight } from "#/world/scene/runtime/scene-lighting-types"

/** game-system.md §7.5 の昼の長さと朝夕の曲線を、既存の三つの色へ重ねる。 */
export function getSceneLight(minute: number): SceneLight {
  return mixSceneLight(mixSceneLight(SCENE_LIGHT_PALETTES[2], SCENE_LIGHT_PALETTES[0], daylight(minute)), SCENE_LIGHT_PALETTES[1], dusk(minute) * 0.85)
}
