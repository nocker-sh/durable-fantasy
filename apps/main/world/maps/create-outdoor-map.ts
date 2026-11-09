import { readMapGrid } from "#/world/maps/read-map-grid"
import { MAP_SPRITES } from "#/world/maps/map-asset-rules"
import type { Cell, MapDefinition } from "#/world/maps/types"

type Props = Readonly<{ id: string; name: string; grid: unknown; kind?: "town" | "field"; spawn?: Cell }>

/** Field arrivals are replaced by the town-facing connection during topology assembly. */
export function createOutdoorMap(props: Props): MapDefinition {
  return { id: props.id, name: props.name, kind: props.kind ?? "field", ...readMapGrid(props.id, props.grid), warps: [], spawn: props.spawn ?? [48, 48], assets: { sprites: MAP_SPRITES } }
}
