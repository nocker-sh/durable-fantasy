// The creatures of one channel of a map (game-system.md §8): one Durable Object per map room, so
// two players striking the same slime take turns and it is beaten once.
import { defineDurableState } from "void/durable"
import { emptyWild, hit, hpOf, type WildState } from "#/world/core/wild.ts"
import { SPAWNS } from "#/world/core/monsters.ts"

export const Wild = defineDurableState({
  initialState: { wild: emptyWild() as WildState },
  methods: {
    /** Every creature on the map: what it has left (0: off recovering) and when it is back. */
    state(context, map: string): Record<string, { hp: number; back: number }> {
      const now = Date.now()
      return Object.fromEntries(SPAWNS.filter((s) => s.map === map).map((s) => [s.id, { hp: hpOf(context.state.wild, s.id, now), back: context.state.wild.back[s.id] ?? 0 }]))
    },
    /** A blow from a player (0 for a miss); refused while it is someone else's fight. */
    strike(context, id: string, damage: number, player: string): { hp: number; beaten: boolean; back: number; refused: boolean } {
      const now = Date.now()
      const r = hit({ ...emptyWild(), ...context.state.wild }, id, damage, now, player)
      context.state.wild = r.state
      return { hp: r.hp, beaten: r.beaten, back: r.state.back[id] ?? 0, refused: r.refused }
    },
  },
})

export default Wild
