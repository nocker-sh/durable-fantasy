import type { SavePoint } from "#/world/core/player-types"
import type { ItemId } from "#/world/core/items/catalog"

export const HOTBAR_SIZE = 10

export const NAME_MAX = 16

/** looks a player can pick from (travellers.ts LOOKS) */
export const LOOK_COUNT = 8

export const NECK_KINDS = ["muffler", "stole", "scarf"] as const

/** colours a neck wrap can be dyed (the cloth ramps in scene/pix.ts) */
export const NECK_RAMPS = ["cRed", "cWine", "cMustard", "cHoney", "cGreen", "cMint", "cBlue", "cSky", "cPlum", "cBrown", "cCream", "cGray"] as const

export const STARTING_GOLD = 200

/** a branch picked up on the road (game-system.md §8): nobody made it, so it carries no mark */
export const STARTING_WEAPON: ItemId = "wooden-stick"

export const MAX_STAMINA = 100

/** fullness falls by one every this many ms */
export const DIGEST_MS = 3 * 60_000

/** HP and SP come back this often while up and about (a share of each maximum, so VIT and MND raise it; seated recovery uses SITTING_REGEN_SHARE) */
export const REGEN_MS = 20_000

export const DEFAULT_NAME = "シグレニ"

/** a name, once chosen, can be changed again only after this long (core/set-profile.ts) */
export const RENAME_GAP_MS = 30 * 24 * 60 * 60_000

export const TOWN_SPAWN: SavePoint = { map: "phanthiet", cell: [38, 80] }
