import type { SavePoint } from "#/world/core/player-types"

export const HOTBAR_SIZE = 10

export const NAME_MAX = 16

/** looks a player can pick from (travellers.ts LOOKS) */
export const LOOK_COUNT = 8

export const NECK_KINDS = ["muffler", "stole", "scarf"] as const

/** colours a neck wrap can be dyed (the cloth ramps in scene/pix.ts) */
export const NECK_RAMPS = ["cRed", "cWine", "cMustard", "cHoney", "cGreen", "cMint", "cBlue", "cSky", "cPlum", "cBrown", "cCream", "cGray"] as const

export const STARTING_GOLD = 200

export const MAX_STAMINA = 100

/** fullness falls by one every this many ms */
export const DIGEST_MS = 3 * 60_000

/** HP and SP come back this often while up and about (more with VIT and INT, twice as much sitting) */
export const REGEN_MS = 20_000

export const DEFAULT_NAME = "シグレニ"

export const TOWN_SPAWN: SavePoint = { map: "phanthiet", cell: [38, 80] }
