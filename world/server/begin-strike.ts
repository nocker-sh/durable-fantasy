import { hit } from "#/world/core/wild/hit"
import type { SkillId } from "#/world/core/skill-types"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { spawnOf } from "#/world/core/spawn-of"
import { planCombat } from "#/world/server/combat-plan"
import type { CombatAudience } from "#/world/server/combat-plan"
import type { WildContext, StrikePlayer, CombatParties } from "#/world/server/wild-coordinator"

type Props = {
  context: WildContext
  players: (owner: string) => StrikePlayer
  parties: CombatParties
  target: string
  damage: number
  owner: string
  request: string
  art?: SkillId
  audience?: CombatAudience
}

export async function beginStrike(props: Props): Promise<{ ok: true; id: number } | { ok: false; reason: "NOT_READY" | "TAKEN" | "TARGET_GONE" }> {
  if (!props.request || !props.owner || !Number.isSafeInteger(props.damage) || props.damage < 0) return { ok: false, reason: "NOT_READY" }
  const previous = props.context.state.jobs[props.owner]
  if (previous?.request === props.request) {
    return previous.target === props.target && previous.damage === props.damage && previous.art === props.art ? { ok: true, id: previous.id } : { ok: false, reason: "NOT_READY" }
  }
  if (previous?.phase === "pending") return { ok: false, reason: "NOT_READY" }
  if (Object.values(props.context.state.jobs).some((job) => job.phase === "pending" && job.target === props.target)) return { ok: false, reason: "TAKEN" }
  const at = Date.now()
  const next = hit({ state: props.context.state.wild, id: props.target, damage: props.damage, now: at, player: props.owner })
  if (next.refused) return { ok: false, reason: next.reason }
  if (props.context.state.deliveries[props.owner]?.length) return { ok: false, reason: "NOT_READY" }
  const id = props.context.state.serial + 1
  if (!Number.isSafeInteger(id)) throw new Error("Strike IDs exhausted")
  const spawn = spawnOf(props.target)!
  const plan = await planCombat({
    players: props.players,
    parties: props.parties,
    owner: props.owner,
    monster: props.target,
    kind: MONSTER_KINDS[spawn.kind],
    beaten: next.beaten,
    audience: props.audience,
    random: Math.random,
  })
  props.context.state.serial = id
  props.context.state.jobs[props.owner] = {
    id,
    request: props.request,
    target: props.target,
    damage: props.damage,
    owner: props.owner,
    ...(props.art ? { art: props.art } : {}),
    at,
    plan,
    phase: "pending",
  }
  await props.context.setAlarm(Date.now() + 100)
  return { ok: true, id }
}
