import type { MapDefinition } from "#/world/maps/types"
import type { Side } from "#/world/maps/grid-types"

export type OutdoorCrossingContext = Readonly<{ here: MapDefinition; there: MapDefinition; side: Side; hereLand: ReadonlySet<number>; thereLand: ReadonlySet<number> }>
