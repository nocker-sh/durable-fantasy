import { ANVIL_GROUND_RADIUS, FORGE_GROUND_HALF_SIZE, WOODPILE_GROUND_HALF_DEPTH, groundRect } from "#/world/town/workshop-footprints"
/** The existing shared forge yard. Rendering and crafting must refer to the same equipment. */
export const CRAFT_YARD = {
  map: "phanthiet-craft",
  forge: [16.6, 26.4],
  anvil: [17.6, 27.8],
  firewood: { centre: [14.6, 28.4], width: 1.6, layers: 4, alongX: true },
} as const

export const CRAFT_FORGE_PLACE = {
  map: CRAFT_YARD.map,
  cell: [Math.floor(CRAFT_YARD.forge[0] * 2), Math.floor(CRAFT_YARD.forge[1] * 2)],
} as const

/** The anvil's circular base is conservatively enclosed by a square for planning. */
export function craftYardFootprints(): { id: string; map: string; rect: readonly [number, number, number, number] }[] {
  const prefix = "facility-craft-forge",
    map = `map-${CRAFT_YARD.map}`
  return [
    { id: `${prefix}/fire`, map, rect: groundRect(CRAFT_YARD.forge, ...FORGE_GROUND_HALF_SIZE) },
    { id: `${prefix}/anvil`, map, rect: groundRect(CRAFT_YARD.anvil, ANVIL_GROUND_RADIUS, ANVIL_GROUND_RADIUS) },
    { id: `${prefix}/firewood`, map, rect: groundRect(CRAFT_YARD.firewood.centre, CRAFT_YARD.firewood.width / 2, WOODPILE_GROUND_HALF_DEPTH) },
  ]
}
