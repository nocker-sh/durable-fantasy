import craft from "#resources/world/maps/phanthiet-craft"
import gate from "#resources/world/maps/phanthiet-gate"
import market from "#resources/world/maps/phanthiet-market"
import town from "#resources/world/maps/phanthiet"
import south_meadow from "#resources/world/maps/south-meadow"
import red_dunes from "#resources/world/maps/red-dunes"
import sea_cliff from "#resources/world/maps/sea-cliff"
import net_sheds from "#resources/world/maps/net-sheds"
import forest_edge from "#resources/world/maps/forest-edge"
import deep_forest from "#resources/world/maps/deep-forest"
import quynhon_gate from "#resources/world/maps/quynhon-gate"
import mountain_pass from "#resources/world/maps/mountain-pass"
import hue_gate from "#resources/world/maps/hue-gate"
import { createOutdoorMap } from "#/world/maps/create-outdoor-map"
import type { MapDefinition } from "#/world/maps/types"

export const OUTDOOR_MAP_DEFINITIONS: readonly Readonly<MapDefinition>[] = [
  createOutdoorMap({ id: "phanthiet", name: "ファンティエット ― 広場", grid: town, kind: "town", spawn: [38, 80] }),
  createOutdoorMap({ id: "phanthiet-market", name: "ファンティエット ― 商店通り", grid: market, kind: "town", spawn: [48, 50] }),
  createOutdoorMap({ id: "phanthiet-craft", name: "ファンティエット ― 職人通り", grid: craft, kind: "town", spawn: [40, 46] }),
  createOutdoorMap({ id: "phanthiet-gate", name: "ファンティエット ― 南門", grid: gate, kind: "town", spawn: [48, 40] }),
  createOutdoorMap({ id: "south-meadow", name: "南の草原", grid: south_meadow }),
  createOutdoorMap({ id: "red-dunes", name: "赤い砂丘", grid: red_dunes }),
  createOutdoorMap({ id: "sea-cliff", name: "海沿いの崖道", grid: sea_cliff }),
  createOutdoorMap({ id: "net-sheds", name: "浜の網小屋", grid: net_sheds }),
  createOutdoorMap({ id: "forest-edge", name: "樹海の入り口", grid: forest_edge }),
  createOutdoorMap({ id: "deep-forest", name: "樹海の奥", grid: deep_forest }),
  createOutdoorMap({ id: "quynhon-gate", name: "クイニョンの門前", grid: quynhon_gate }),
  createOutdoorMap({ id: "mountain-pass", name: "峠道", grid: mountain_pass }),
  createOutdoorMap({ id: "hue-gate", name: "フエの門前", grid: hue_gate }),
]
