// The exchange board (economy.md §5): the notice board in the town's 寄り合い所, where orders are put
// up, taken down and what changed hands is collected. Nobody minds it; it is open at every hour.
// It copies the board at the foot of the world tree: a paper pinned there shows on the board in
// every town's 寄り合い所, which is why it is one board for every town. Its fees go to the 寄り合い.
import { INTERIORS } from "#/world/town/interiors"

const hall = INTERIORS.find((i) => i.house.id === "h-m5")!

export const EXCHANGE_BOARD = { map: hall.id, cell: hall.keeper, name: "取引の掲示板" } as const
/** How close you stand to read and use it, in cells. */
export const BOARD_REACH = 4
