import { SOUTH_MEADOW_LAYOUT } from "#/world/maps/layouts/south-meadow"
import { RED_DUNES_LAYOUT } from "#/world/maps/layouts/red-dunes"
import { SEA_CLIFF_LAYOUT } from "#/world/maps/layouts/sea-cliff"
import { NET_SHEDS_LAYOUT } from "#/world/maps/layouts/net-sheds"
import { FOREST_EDGE_LAYOUT } from "#/world/maps/layouts/forest-edge"
import { DEEP_FOREST_LAYOUT } from "#/world/maps/layouts/deep-forest"
import { QUYNHON_GATE_LAYOUT } from "#/world/maps/layouts/quynhon-gate"
import { MOUNTAIN_PASS_LAYOUT } from "#/world/maps/layouts/mountain-pass"
import { HUE_GATE_LAYOUT } from "#/world/maps/layouts/hue-gate"
import { withRimmedLayout } from "#/world/maps/with-rimmed-layout"
import type { Layout } from "#/world/maps/layout-types"

export const LAYOUTS: Record<string, Layout> = {
  "south-meadow": SOUTH_MEADOW_LAYOUT,
  "red-dunes": RED_DUNES_LAYOUT,
  "sea-cliff": SEA_CLIFF_LAYOUT,
  "net-sheds": NET_SHEDS_LAYOUT,
  "forest-edge": FOREST_EDGE_LAYOUT,
  "deep-forest": DEEP_FOREST_LAYOUT,
  "quynhon-gate": QUYNHON_GATE_LAYOUT,
  "mountain-pass": MOUNTAIN_PASS_LAYOUT,
  "hue-gate": HUE_GATE_LAYOUT,
}

export const OPEN_SIDES: Record<string, string> = { "sea-cliff": "e", "net-sheds": "e", "quynhon-gate": "e" }
export const FIELD_LAYOUTS: Record<string, Layout> = Object.fromEntries(
  Object.entries(LAYOUTS).map((entry2) => {
    const id = entry2[0]
    const l = entry2[1]
    return [id, withRimmedLayout(l, OPEN_SIDES[id])]
  }),
)
