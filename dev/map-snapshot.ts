import * as THREE from "three"
import { MAP_SCENES } from "#/world/scene/runtime/definitions"
import { setLayout } from "#/world/scene/set-layout"
import { initWalk } from "#/world/scene/init-walk"
import { blocked, WN } from "#/world/scene/world"
import { resetRegistries } from "#/world/scene/construction/reset-registries"
import { places } from "#/world/scene/construction/registry"

/** Bake exactly the selected scene without joining or redirecting a saved player. */
export function mapSnapshot(id: string) {
  const definition = MAP_SCENES[id]
  if (!definition) throw new Error(`Unknown scene: ${id}`)
  setLayout(definition.layout)
  resetRegistries()
  initWalk()
  const root = new THREE.Group()
  definition.build(root)
  let bits = ""
  for (const cell of blocked) bits += cell ? "1" : "0"
  return {
    id,
    size: WN,
    blocked: bits,
    places: Object.fromEntries(
      Object.entries(places).map((entry) => {
        const key = entry[0]
        const nestedValue = entry[1]
        const x = nestedValue[0]
        const z = nestedValue[1]
        return [key, [Math.floor(x * 2), Math.floor(z * 2)]]
      }),
    ),
  }
}
