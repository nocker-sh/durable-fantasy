import { isAttackCoolingDown } from "#/world/core/is-attack-cooling-down"
import { derive } from "#/world/core/derive"
import { skillOf } from "#/world/core/skill-of"
import { isArt } from "#/world/core/is-art"
import { FIGHT_STAMINA } from "#/world/core/monsters"
import type { PlayerState } from "#/world/core/player-types"
import type { Derived } from "#/world/core/stats-types"
import type { Art, SkillId } from "#/world/core/skill-types"

type Props = Readonly<{ player: PlayerState; art?: SkillId; struck?: number; now: number }>
type Readiness = { kind: "ready"; stats: Derived; art: (Art & { kind: "strike" | "spell" }) | null } | { kind: "ignore" } | { kind: "refused"; reason: "FALLEN" | "EXHAUSTED" }

/** 保存済みの生存状態、技の種類、攻撃の間隔、スタミナを順に確かめる。技も通常の一撃と同じ間隔を守る。技の支払は保存先が行う。 */
export function getAttackReadiness(props: Props): Readiness {
  if (props.player.hp <= 0) return { kind: "refused", reason: "FALLEN" }
  const stats = derive(props.player)
  const art = props.art ? skillOf(props.art) : null
  if (art && (!isArt(art) || art.kind === "prayer")) return { kind: "ignore" }
  if (isAttackCoolingDown({ delay: stats.attackDelay, struck: props.struck, now: props.now })) return { kind: "ignore" }
  if (props.player.stamina < FIGHT_STAMINA) return { kind: "refused", reason: "EXHAUSTED" }
  return { kind: "ready", stats, art }
}
