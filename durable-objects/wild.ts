// One creature state and pending strikes per channel (game-system.md §8).
import { defineDurableState } from "void/durable"
import { viewWild } from "#/world/core/wild/view-wild"
import type { SkillId } from "#/world/core/skill-types"
import { initialWildRecord } from "#/world/server/initial-wild-record"
import { wildMigrations } from "#/world/server/wild-record"
import { publishWild } from "#/world/server/publish-wild"
import { beginStrike } from "#/world/server/begin-strike"
import { advanceStrike } from "#/world/server/advance-strike"
import { deliverStrike } from "#/world/server/deliver-strike"
import { recoverStrikes } from "#/world/server/recover-strikes"
import type { CombatAudience } from "#/world/server/combat-plan"
import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"

const players = (owner: string) => Player.get(owner)
const parties = (party: string) => Party.get(party)
export const Wild = defineDurableState({
  initialState: initialWildRecord,
  version: 3,
  migrations: wildMigrations,
  methods: {
    state(context, map: string): Record<string, { hp: number; back: number }> {
      return viewWild(context.state.wild, map, Date.now())
    },
    snapshot(context, map: string) {
      return publishWild(context.state, map, Date.now())
    },
    beginStrike(context, input: { target: string; damage: number; owner: string; request: string; art?: SkillId; audience?: CombatAudience }) {
      const target = input.target
      const damage = input.damage
      const owner = input.owner
      const request = input.request
      const art = input.art
      const audience = input.audience

      return beginStrike({ context: context, players: players, parties: parties, target: target, damage: damage, owner: owner, request: request, art: art, audience: audience })
    },
    deliverStrike(context, owner: string, id: number) {
      return deliverStrike({ context: context, players: players, owner: owner, id: id })
    },
    strike(context, owner: string, id: number) {
      return advanceStrike({ context: context, players: players, parties: parties, owner: owner, id: id })
    },
  },
  alarm(context) {
    return recoverStrikes(context, players, parties)
  },
})
export default Wild
