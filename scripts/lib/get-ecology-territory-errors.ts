import { getEcologySiteTerritories } from "#/scripts/lib/get-ecology-site-territories"
import type { EcologyPlacement } from "#/scripts/lib/ecology-zone-schema"
import type { Spawn } from "#/world/core/monster-types"
type Props = { placement: EcologyPlacement; territories: ReadonlyArray<Spawn["area"]> }
/** Separate populations of the same species cannot borrow resources from an unreachable territory. */
export function getEcologyTerritoryErrors(props: Props): string[] {
  const errors: string[] = [],
    seen = new Set<string>()
  for (const site of props.placement.sites) if (!getEcologySiteTerritories({ site, territories: props.territories }).length) errors.push(`Site ${site.id} leaves registered territories`)
  for (const area of props.territories) {
    const key = area.join(",")
    if (seen.has(key)) continue
    seen.add(key)
    for (const role of ["food", "water", "rest", "escape"]) {
      const hasAccess = props.placement.sites.some((site) =>
        site.features.some(
          (feature) =>
            feature.role === role &&
            feature.access.some((access) => {
              const grid = site.grid,
                x = grid.origin_tiles[0] + (access[0] + 0.5) * grid.cell_tiles,
                z = grid.origin_tiles[1] + (access[1] + 0.5) * grid.cell_tiles
              return x >= area[0] && x <= area[2] && z >= area[1] && z <= area[3]
            }),
        ),
      )
      if (!hasAccess) errors.push(`Territory ${key} has no ${role} approach`)
    }
  }
  return errors
}
