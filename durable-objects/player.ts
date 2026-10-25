// One Durable Object per player holds their data (game-system.md §13). Commands run one at a time here, so two
// purchases sent at once can never both spend the same gold.
import { defineDurableState } from "void/durable"
import { apply, type Context, type Transition } from "#/world/core/apply.ts"
import type { Command, ServerCommand } from "#/world/core/commands.ts"
import { loadPlayer, newPlayer, settle, type PlayerState } from "#/world/core/player.ts"
import { derive } from "#/world/core/stats.ts"
import { addItem } from "#/world/core/bag.ts"
import type { ItemId } from "#/world/core/items.ts"

export const Player = defineDurableState({
  initialState: { player: newPlayer() as PlayerState },
  methods: {
    read(context): PlayerState {
      const p = loadPlayer(context.state.player)
      // HP that has come back since it was last counted
      context.state.player = settle(p, derive(p), Date.now())
      return context.state.player
    },
    /** Run a command; the room passes the price the shop asks today, the time is the server's. */
    run(context, command: Command | ServerCommand, ctx: Omit<Context, "now"> = {}): Transition {
      const result = apply(loadPlayer(context.state.player), command, { ...ctx, now: Date.now() })
      if (result.ok) context.state.player = result.state
      return result
    },
    /** Dev only: put things in the bag (checks and the debug panel). */
    give(context, item: ItemId, count: number): PlayerState {
      const p = loadPlayer(context.state.player)
      const bag = addItem(p.bag, item, count)
      if (bag) context.state.player = { ...p, bag }
      return context.state.player
    },
    /** Start over as a new traveller (the dev debug panel). */
    reset(context): PlayerState {
      context.state.player = newPlayer()
      return context.state.player
    },
  },
})

export default Player
