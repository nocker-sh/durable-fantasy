import type { Party } from "#/world/core/party/types"

export const emptyParty = (): Party => ({ leader: "", mode: "own", members: [] })
