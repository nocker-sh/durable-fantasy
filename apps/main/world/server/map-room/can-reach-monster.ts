import { getMonsterCombatTime } from "#/world/core/get-monster-combat-time"
import type { CreatureHealth } from "#/world/core/wild/types"
import { monsterAt } from "#/world/core/monster-at"
import { walkable } from "#/world/maps/walkable"
import { reachable } from "#/world/server/map-room/reachable"
import type { AttackRequestContext } from "#/world/server/map-room/attack-types"
import type { Spawn } from "#/world/core/monster-types"

/** 保存を待った後の到達範囲と、受付時刻の生き物の位置を、保存済みの武器の届く距離で照合する。 */
export function canReachMonster(room: Pick<AttackRequestContext, "map" | "me">, spawn: Spawn, timing: { now: number; combat?: CreatureHealth["combat"]; reach: number }): boolean {
  const at = monsterAt(spawn, getMonsterCombatTime({ combat: timing.combat, now: timing.now }), (x, z) => walkable(room.map, [Math.floor(x * 2), Math.floor(z * 2)]))
  return reachable(room.me).some((cell) => Math.hypot((cell[0] + 0.5) / 2 - at.x, (cell[1] + 0.5) / 2 - at.z) <= timing.reach + 0.8)
}
