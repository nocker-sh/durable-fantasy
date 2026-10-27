// The creatures of one channel of a map (game-system.md §8): one Durable Object per map room, so
// two players striking the same slime take turns and it is beaten once.
import { defineDurableState } from "void/durable"
import { emptyWild, hit, hpOf, type WildState } from "#/world/core/wild.ts"
import { spawnsOn } from "#/world/core/monsters.ts"
import type { SkillId } from "#/world/core/skills.ts"
import type { Transition } from "#/world/core/apply.ts"
import { Player } from "./player.ts"

export const Wild = defineDurableState({
  initialState: { wild: emptyWild() as WildState },
  methods: {
    /** Every creature on the map: what it has left (0: off recovering) and when it is back. */
    state(context, map: string): Record<string, { hp: number; back: number }> {
      const now = Date.now()
      return Object.fromEntries(spawnsOn(map).map((s) => [s.id, { hp: hpOf(context.state.wild, s.id, now), back: context.state.wild.back[s.id] ?? 0 }]))
    },
    /** A blow from a player (0 for a miss); refused while it is someone else's fight. */
    async strike(context, id: string, damage: number, player: string, art?: SkillId) {
      const now = Date.now()
      const r = hit({ ...emptyWild(), ...context.state.wild }, id, damage, now, player)
      // Void serializes this method, including the payment await: another blow cannot
      // change this target between eligibility, payment and the committed hit.
      let payment: Transition | undefined
      if (!r.refused && art) {
        payment = await Player.get(player).run({ type: "art", skill: art })
        if (!payment.ok) return { hp: hpOf(context.state.wild, id, now), beaten: false, back: context.state.wild.back[id] ?? 0, refused: true, reason: payment.reason, payment }
      }
      context.state.wild = r.state
      return { hp: r.hp, beaten: r.beaten, back: r.state.back[id] ?? 0, refused: r.refused, reason: r.reason, payment }
    },
  },
})

export default Wild
