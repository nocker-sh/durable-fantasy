import type { PlayerState } from "#/world/core/player-types"
import { playerStateSchema, v2Schema, v1Schema } from "#/world/core/player-schema"
import { fromV2 } from "#/world/core/from-v2"
import { newPlayer } from "#/world/core/new-player"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { derive } from "#/world/core/derive"

/** Decode current and supported older saves without replacing unreadable data. */
export function parsePlayer(saved: unknown): PlayerState | null {
  const current = playerStateSchema.safeParse(saved)
  if (current.success) return current.data
  const two = v2Schema.safeParse(saved)
  if (two.success) return fromV2(two.data)
  const old = v1Schema.safeParse(saved)
  if (old.success) {
    const fresh = newPlayer()
    const equipment = { ...emptyEquipment(), weapon: old.data.weapon }
    const maxHp = derive({ ...fresh, equipment }).maxHp
    return { ...fresh, profileComplete: true, gold: old.data.gold, bag: old.data.bag, hotbar: old.data.hotbar, equipment, hp: Math.min(old.data.hp, maxHp) }
  }
  return null
}
