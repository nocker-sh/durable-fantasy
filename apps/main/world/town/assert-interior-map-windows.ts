import { assertInteriorWindowAlignment } from "#/world/town/assert-interior-window-alignment"
import { TILE_M } from "#/world/town/fit"
import type { MapSpace } from "#/world/maps/map-space-types"
import type { Interior } from "#/world/town/interiors"

/** Every authored window on this floor must resolve once to the same exterior fixture. */
export function assertInteriorMapWindows(interior: Interior, space: MapSpace): void {
  const source = interior.house.authored,
    site = source?.exterior
  if (!source || !site) throw new Error(`Interior window inventory has no authored site: ${interior.id}`)
  const expected = source.windows.filter((window) => window.floor === interior.floor),
    windows = interior.windows ?? [],
    outsideWindows = site.windows.filter((window) => window.floor === interior.floor),
    seen = new Set<string>()
  if (windows.length !== expected.length || outsideWindows.length !== expected.length) throw new Error(`Interior window inventory differs: ${interior.id}`)
  for (const window of windows) {
    const matches = outsideWindows.filter((outside) => outside.id === window.id)
    if (seen.has(window.id) || expected.filter((source) => source.id === window.id).length !== 1 || matches.length !== 1)
      throw new Error(`Interior window inventory differs: ${interior.id}/${window.id}`)
    seen.add(window.id)
    assertInteriorWindowAlignment({ window, outside: matches[0], space, foundationMetres: site.floorY * TILE_M })
  }
}
