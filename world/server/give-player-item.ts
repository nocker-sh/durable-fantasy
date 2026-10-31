import { addItem } from "#/world/core/add-item"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { publishPlayer } from "#/world/server/publish-player"
import type { ItemId } from "#/world/core/items/catalog"
import type { PlayerState } from "#/world/core/player-types"
import type { PlayerRecord } from "#/world/server/player-record"

type Props = Readonly<{ item: ItemId; count: number }>

export function givePlayerItem(record: PlayerRecord, input: Props): PlayerState {
  if (record.trade?.status === "prepared") throw new Error("Trade is pending")
  const player = restoreSavedPlayer(record.player)
  const bag = addItem({ bag: player.bag, item: input.item, count: input.count })
  publishPlayer(record, bag ? { ...player, bag } : player)
  return record.player
}
