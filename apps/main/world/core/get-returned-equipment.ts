import { putStack } from "#/world/core/put-stack"
import { withoutWornSlot } from "#/world/core/without-worn-slot"
import type { Bag } from "#/world/core/bag-types"
import type { GameEvent } from "#/world/core/commands"
import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"
import type { ReturnedEquipment } from "#/world/core/equipment-types"

type Props = { state: PlayerState; bag: Bag; worn: PlayerState["worn"]; slots: readonly Slot[]; selectedSlot: Slot }

/** 外す品が全て収まるまで入力を変更せず、消耗した装備をそのまま袋へ返す。 */
export function getReturnedEquipment(props: Props): ReturnedEquipment {
  const returned = { bag: props.bag, worn: { ...props.worn } }
  const events: GameEvent[] = []
  for (const slot of props.slots) {
    const item = props.state.equipment[slot]
    if (!item) return { ok: false, reason: "NOTHING_EQUIPPED" }
    const bag = putStack(returned.bag, { item, count: 1, ...props.state.worn[slot] })
    if (!bag) return { ok: false, reason: "BAG_FULL" }
    returned.bag = bag
    if (slot !== props.selectedSlot) returned.worn = withoutWornSlot(returned.worn, slot)
    events.push({ type: "unequipped", item, slot })
  }
  return { ok: true, ...returned, events }
}
