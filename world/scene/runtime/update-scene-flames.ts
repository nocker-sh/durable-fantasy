import { fireLights } from "#/world/scene/construction/registry"
import type { SceneHouseLights } from "#/world/scene/runtime/scene-house-lights"

/** 常時の火と夜だけの火を区別し、使われていない部屋の灯りは揺らさず消す。 */
export function updateSceneFlames(time: number, night: number, rooms: Pick<SceneHouseLights, "isActive">): void {
  for (const fixture of fireLights) {
    const flicker = 0.75 + Math.sin(time * 13 + fixture.seed) * 0.12 + Math.sin(time * 29 + fixture.seed * 3) * 0.08
    fixture.light.intensity = fixture.room && !rooms.isActive(fixture.light) ? 0 : fixture.base > 0 ? fixture.base * flicker : -fixture.base * night * flicker
  }
}
