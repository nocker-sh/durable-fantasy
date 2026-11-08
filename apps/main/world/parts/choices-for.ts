import { COMMISSIONS } from "#/world/core/commissions"
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { storageOpen } from "#/world/town/warehouse"
import type { DialogueChoice, GameState } from "#/world/state"
import { keepingShop } from "#/world/parts/keeping-shop"
import { errandChoices } from "#/world/parts/errand-choices"

/** Everything you can do with a resident now, ending with goodbye. */
export function choicesFor(state: GameState, name: string): DialogueChoice[] {
  const min = state.clock.min
  const takesWork = COMMISSIONS.some((c) => c.craftsman === name) && keepingShop(name, min)
  return [
    ...(keepingShop(name, min) ? [{ label: "買い物をする", action: "shop" as const }] : []),
    ...(takesWork ? [{ label: "仕事を頼む", action: "commission" as const }] : []),
    ...(name === STORAGE_KEEPER && storageOpen(min) ? [{ label: "荷を預ける・引き取る", action: "storage" as const }] : []),
    ...errandChoices(state, name),
    { label: "さようなら", action: "close" as const },
  ]
}
