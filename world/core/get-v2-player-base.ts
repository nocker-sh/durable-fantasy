import { MAX_LEVEL, STARTING_POINTS } from "#/world/core/growth-rules"
import { pointsForLevel } from "#/world/core/points-for-level"
import { startingStats } from "#/world/core/starting-stats"
import { lifeFromProficiency } from "#/world/core/life-from-proficiency"
import { newPlayer } from "#/world/core/new-player"
import { toLegacyHotbarEntry } from "#/world/core/to-legacy-hotbar-entry"
import type { PlayerState } from "#/world/core/player-types"
import type { v2Schema } from "#/world/core/player-schema"
import type { z } from "zod"
type Props = z.infer<typeof v2Schema>

/** 旧保存の名前と所持品を残し、能力値と生活スキルを現行の形式へ移す。 */
export function getV2PlayerBase(saved: Props): PlayerState {
  const level = Math.min(saved.level, MAX_LEVEL)
  const points = Array.from({ length: Math.max(0, level - 1) }, (_, index) => pointsForLevel(index + 2)).reduce((total, amount) => total + amount, STARTING_POINTS)
  const rest = { ...saved }
  for (const key of ["skills", "hotbar", "version"]) Reflect.deleteProperty(rest, key)

  return {
    ...newPlayer(saved.name, saved.look),
    ...rest,
    version: 3,
    level,
    exp: level >= MAX_LEVEL ? 0 : saved.exp,
    stats: startingStats(),
    statPoints: points,
    life: lifeFromProficiency(saved.skills),
    worn: {},
    hotbar: saved.hotbar.map(toLegacyHotbarEntry),
    ready: {},
  }
}
