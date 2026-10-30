import { applyReservedStrike } from "#/world/server/apply-reserved-strike"
import { hit } from "#/world/core/wild/hit"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { spawnOf } from "#/world/core/spawn-of"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import { planCombat } from "#/world/server/combat-plan"
import type { StrikeResult, WildContext, StrikePlayer, CombatParties } from "#/world/server/wild-coordinator"
import { RETRY_MS } from "#/world/server/wild-coordinator"

type Props = {
  context: WildContext
  players: (owner: string) => StrikePlayer
  parties: CombatParties
  owner: string
  id: number
}

export async function advanceStrike(props: Props): Promise<StrikeResult> {
  const job = props.context.state.jobs[props.owner]
  if (!job || job.id !== props.id) return { hp: 0, back: 0, beaten: false, refused: true, reason: "NOT_READY" }
  if (job.phase === "done") {
    const payment = job.art ? await props.players(props.owner).payStrike({ source: props.context.id.toString(), id: job.id, art: job.art, life: job.plan?.life }) : undefined
    return { ...job.result, ...(payment ? { payment } : {}), ...(!job.result.refused && job.plan?.counter ? { counter: job.plan.counter } : {}) }
  }
  await props.context.setAlarm(Date.now() + RETRY_MS)
  const spawn = spawnOf(job.target)!
  const plan =
    job.plan ??
    (await planCombat({
      players: props.players,
      parties: props.parties,
      owner: props.owner,
      monster: job.target,
      kind: MONSTER_KINDS[spawn.kind],
      beaten: hit({ state: props.context.state.wild, id: job.target, damage: job.damage, now: job.at, player: props.owner }).beaten,
      audience: undefined,
      random: Math.random,
    }))
  const payment = await props.players(props.owner).payStrike({ source: props.context.id.toString(), id: job.id, art: job.art, life: plan.life })
  const result = applyReservedStrike({ context: props.context, job, payment, owner: props.owner })
  const deliveries: { owner: string; delivery: CombatDelivery }[] = []
  if (!result.refused) {
    for (const effect of plan.effects) {
      const id = props.context.state.deliverySerial + 1
      if (!Number.isSafeInteger(id)) throw new Error("Combat delivery IDs exhausted")
      const delivery = { id, command: effect.command, ...(effect.life !== undefined ? { life: effect.life } : {}) }
      props.context.state.deliverySerial = id
      const queue = (props.context.state.deliveries[effect.owner] ??= [])
      queue.push(delivery)
      deliveries.push({ owner: effect.owner, delivery })
    }
  }
  props.context.state.jobs[props.owner] = { ...job, plan, phase: "done", result, deliveries }
  return { ...result, ...(job.art ? { payment } : {}), ...(!result.refused && plan.counter ? { counter: plan.counter } : {}) }
}
