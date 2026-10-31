import type { MapDefinition } from "#/world/maps/types"
import type { Interior } from "#/world/town/interiors"

export type IndoorMapOptions = Readonly<{ sprites: string; name: (interior: Interior) => string; npcs: (interior: Interior) => MapDefinition["npcs"] }>
