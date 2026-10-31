import { MONSTER_KINDS } from "#/world/core/monsters"
import type { MonsterView } from "#/world/scene/monsters"

/** The rendered percentage changes on damage and recovery, not on every animation frame. */
export function updateMonsterHealth(m: Pick<MonsterView, "hp" | "spawn" | "hpWidth" | "hpBar">) {
  const width = Math.round((m.hp / MONSTER_KINDS[m.spawn.kind].hp) * 100)
  if (m.hpWidth === width) return
  m.hpBar.style.width = `${width}%`
  m.hpWidth = width
}
