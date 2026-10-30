import type { Critter } from "#/world/scene/animal-types"

/** Active native animals for the current scene; scene teardown owns their lifetime. */
export const critters: Critter[] = []
