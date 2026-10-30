import { withoutKeys } from "#/lib/engine/without-keys"
import type { ItemId } from "#/world/core/items/catalog"
import type { PlayerState } from "#/world/core/player-types"
import type { gatheringTool } from "#/world/core/gathering-tool"

type Props = { player: PlayerState; selected: ReturnType<typeof gatheringTool> }
type WornTool = Pick<PlayerState, "bag" | "equipment" | "worn"> & { broke: ItemId | null }

/** Wear a selected tool in a fresh inventory, without changing a player whose gather may be refused. */
export function wearGatheringTool(props: Props): WornTool {
  const state = props.player
  const selected = props.selected
  const unchanged = { bag: state.bag, equipment: state.equipment, worn: state.worn, broke: null }
  if (!selected) return unchanged

  const tool = selected.stack
  const durability = (tool.dur ?? 1) - 1
  if (selected.source === "weapon") {
    if (durability <= 0) return { ...unchanged, equipment: { ...state.equipment, weapon: null }, worn: withoutKeys(state.worn, ["weapon"]), broke: tool.item }

    return { ...unchanged, worn: { ...state.worn, weapon: { ...state.worn.weapon, dur: durability } } }
  }

  const bag = state.bag.map((stack, index) => {
    if (index !== selected.index) return stack
    if (durability <= 0) return null

    return { ...tool, dur: durability }
  })

  return { ...unchanged, bag, broke: durability <= 0 ? tool.item : null }
}
