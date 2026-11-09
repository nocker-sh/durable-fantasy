// Shared gathering resources and persisted attempts for one parallel town (economy.md §1).
import { defineDurableState } from "void/durable"
import { NODES } from "#/world/core/gather"
import { leftAt } from "#/world/core/nature/left-at"
import { initialNatureRecord } from "#/world/server/initial-nature-record"
import { natureMigrations } from "#/world/server/nature-migrations"
import { restoreNature } from "#/world/server/restore-nature"
import { beginGather } from "#/world/server/begin-gather"
import { finishGather } from "#/world/server/finish-gather"
import { recoverGathering } from "#/world/server/recover-gathering"
import { Player } from "#/durable-objects/player"

const players = (owner: string) => Player.get(owner)
export const Nature = defineDurableState({
  initialState: initialNatureRecord,
  version: 1,
  migrations: natureMigrations,
  methods: {
    left(context, map: string): Record<string, number> {
      restoreNature(context.state.nature)
      const now = Date.now()
      return Object.fromEntries(NODES.filter((n) => n.map === map).map((n) => [n.id, leftAt(context.state.nature, n.id, now)]))
    },
    beginGather(context, input: { owner: string; connection: string; seq: number; node: string }) {
      const owner = input.owner
      const connection = input.connection
      const seq = input.seq
      const node = input.node

      return beginGather({ context: context, players: players, owner: owner, connection: connection, seq: seq, node: node })
    },
    finishGather(context, owner: string, id: number) {
      return finishGather({ context: context, players: players, owner: owner, id: id })
    },
  },
  alarm(context) {
    return recoverGathering(context, players)
  },
})
export default Nature
