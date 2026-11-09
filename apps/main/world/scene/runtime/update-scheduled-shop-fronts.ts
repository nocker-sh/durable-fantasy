import { shopOpen } from "#/world/maps/shop-open"
import type { shopBoards } from "#/world/scene/dressing"
import type { stalls } from "#/world/scene/construction/registry"

type Props = Readonly<{ minute: number; boards: Readonly<typeof shopBoards>; stalls: Readonly<typeof stalls>; staffedPlaces: ReadonlySet<string> }>

/** 店の札は営業判定に、屋台の品と覆いはその場の売り手に合わせる。 */
export function updateScheduledShopFronts(props: Props): void {
  for (const board of props.boards) {
    const isOpen = shopOpen(board.shop, props.minute)
    board.open.visible = isOpen
    board.shut.visible = !isOpen
    if (board.wares) board.wares.visible = isOpen
  }
  for (const entry of Object.entries(props.stalls)) {
    const stall = entry[1]
    const isOpen = props.staffedPlaces.has(entry[0])
    if (stall.vanish && stall.group) stall.group.visible = isOpen
    else {
      stall.wares.visible = isOpen
      stall.cover.visible = !isOpen
    }
  }
}
