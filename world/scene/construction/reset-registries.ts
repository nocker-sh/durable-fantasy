import { litSprites } from "#/world/scene/gfx"
import { glowMats, fireLights, houseGlows, houseShutters, lamps, stalls, updaters, movingObjects, chimneys, places, occluders } from "#/world/scene/construction/registry"

/** Empty the registries before building another map (only one map exists at a time). */
export function resetRegistries() {
  glowMats.length = 0
  fireLights.length = 0
  updaters.length = 0
  movingObjects.clear()
  chimneys.length = 0
  occluders.length = 0
  houseGlows.length = 0
  houseShutters.length = 0
  lamps.length = 0
  litSprites.length = 0
  for (const k of Object.keys(stalls)) delete stalls[k]
  for (const k of Object.keys(places)) delete places[k]
}
