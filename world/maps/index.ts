import { createMaps } from "#/world/maps/create-maps"

/** Playable outdoor maps (game-system.md §1); new maps stay closed until checked. */
export const OPEN_FIELDS: readonly string[] = ["south-meadow", "forest-edge", "deep-forest", "red-dunes", "sea-cliff", "net-sheds", "quynhon-gate", "mountain-pass", "hue-gate"]

export const MAPS = createMaps()

/** How close a player must be to an NPC to talk or trade, in walk cells. */
export const TALK_CELLS = 6
