import { connectOutdoorMaps } from "#/world/maps/connect-outdoor-maps"
import { assertMapSpaceRegistry } from "#/world/maps/assert-map-space-registry"
import type { Cell, MapDefinition } from "#/world/maps/types"
import { indoorMaps } from "#/world/maps/indoor-maps"
import { RESIDENTS } from "#/world/town/residents"
import { workSpot } from "#/world/town/work-spot"
import { getSpotCell } from "#/world/maps/get-spot-cell"
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
import { INTERIORS } from "#/world/town/interiors"
import { keeperPlace } from "#/world/town/keeper-place"
import { keepersOf } from "#/world/town/keepers-of"
import { outsideDoor } from "#/world/town/outside-door"

type Grid = { size: number; rows: string[]; places?: Record<string, number[]> }
const grid = (g: Grid) => ({ size: g.size, rows: g.rows, npcs: [], places: (g.places ?? {}) as unknown as Record<string, Cell> })
/** Every resident's sprites are baked into one directory, whichever map they live on. */
const SPRITES = "/tmp/sprites"

const STREETS = {
  phanthiet: {
    id: "phanthiet",
    name: "ファンティエット ― 広場",
    kind: "town",
    ...grid(town),
    warps: [],
    spawn: [38, 80],
    assets: { sprites: SPRITES },
  },
  "phanthiet-market": {
    id: "phanthiet-market",
    name: "ファンティエット ― 商店通り",
    kind: "town",
    ...grid(market),
    warps: [],
    spawn: [48, 50],
    assets: { sprites: SPRITES },
  },
  "phanthiet-craft": {
    id: "phanthiet-craft",
    name: "ファンティエット ― 職人通り",
    kind: "town",
    ...grid(craft),
    warps: [],
    spawn: [40, 46],
    assets: { sprites: SPRITES },
  },
  "phanthiet-gate": {
    id: "phanthiet-gate",
    name: "ファンティエット ― 南門",
    kind: "town",
    ...grid(gate),
    warps: [],
    spawn: [48, 40],
    assets: { sprites: SPRITES },
  },
} satisfies Record<string, MapDefinition>

/** The land outside town: a map to a square of the world grid (grid.ts), joined to its neighbours there. */
const field = (id: string, name: string, g: Grid): MapDefinition => ({
  id,
  name,
  kind: "field",
  ...grid(g),
  warps: [],
  spawn: [48, 48],
  assets: { sprites: SPRITES },
})
const FIELDS: MapDefinition[] = [
  field("south-meadow", "南の草原", south_meadow),
  field("red-dunes", "赤い砂丘", red_dunes),
  field("sea-cliff", "海沿いの崖道", sea_cliff),
  field("net-sheds", "浜の網小屋", net_sheds),
  field("forest-edge", "樹海の入り口", forest_edge),
  field("deep-forest", "樹海の奥", deep_forest),
  field("quynhon-gate", "クイニョンの門前", quynhon_gate),
  field("mountain-pass", "峠道", mountain_pass),
  field("hue-gate", "フエの門前", hue_gate),
]

/** Playable outdoor maps (game-system.md §1); new maps stay closed until checked. */
export const OPEN_FIELDS: readonly string[] = ["south-meadow", "forest-edge", "deep-forest", "red-dunes", "sea-cliff", "net-sheds", "quynhon-gate", "mountain-pass", "hue-gate"]

/** The city a map belongs to, as shown before the district: "ファンティエット ― 広場". */
const CITY_NAME: Record<string, string> = { phanthiet: "ファンティエット" }

/** Each building you can enter is a map of its own; its door on the street warps you inside. */
const INDOORS = indoorMaps(INTERIORS, {
  sprites: SPRITES,
  name: (it) => `${CITY_NAME[it.house.map.split("-")[0]] ?? ""} ― ${it.house.name}${it.floor > 0 ? ` ― ${it.floor + 1}階` : ""}`,
  npcs: (it) =>
    it.floor === 0
      ? keepersOf(it).flatMap((name) => {
          const p = keeperPlace(name)
          return p ? [{ name, cell: p.cell }] : []
        })
      : [],
})

/** The street side of every door you can go through. */
function withDoors(def: MapDefinition): MapDefinition {
  const doors = INTERIORS.filter((it) => it.floor === 0 && it.house.map === def.id).map((it) => ({ at: outsideDoor(it.house).door, to: { map: it.id, at: it.arrive } }))
  return { ...def, warps: [...def.warps, ...doors] }
}

const OUTDOORS = connectOutdoorMaps(Object.fromEntries([...Object.values(STREETS), ...FIELDS].map((map) => [map.id, map])))

export const MAPS: Record<string, MapDefinition> = {
  ...Object.fromEntries(Object.values(OUTDOORS).map((d) => [d.id, d.kind === "town" ? withDoors(d) : d])),
  ...INDOORS,
}
assertMapSpaceRegistry(MAPS)
// each map's usual people: those whose work is here (once the places are known)
for (const m of Object.values(MAPS)) {
  m.npcs = RESIDENTS.flatMap((r) => {
    const spot = workSpot(r)
    const cell = spot.map === m.id ? getSpotCell({ spot, places: m.places }) : null
    return cell ? [{ name: r.name, cell }] : []
  })
}

/** How close (in cells) a player must be to an NPC to talk or trade: 3 tiles. */
export const TALK_CELLS = 6
