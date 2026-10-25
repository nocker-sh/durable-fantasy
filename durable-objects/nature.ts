// The gathering spots of one parallel town (economy.md §1): one Durable Object, so two players at
// the same tree take turns and it never gives more than it has.
import { defineDurableState } from "void/durable"
import { NODES } from "#/world/core/gather.ts"
import { emptyNature, giveOne, leftAt, takeOne, type NatureState } from "#/world/core/nature.ts"

export const Nature = defineDurableState({
  initialState: { nature: emptyNature() as NatureState },
  methods: {
    /** How much every spot on a map has left. */
    left(context, map: string): Record<string, number> {
      const now = Date.now()
      return Object.fromEntries(NODES.filter((n) => n.map === map).map((n) => [n.id, leftAt(context.state.nature, n.id, now)]))
    },
    /** Take one go; the number left after, or -1 when it was already spent. */
    take(context, id: string): number {
      const now = Date.now()
      const next = takeOne(context.state.nature, id, now)
      if (!next) return -1
      context.state.nature = next
      return leftAt(next, id, now)
    },
    /** Put a go back (the player could not carry it). */
    give(context, id: string): number {
      const now = Date.now()
      context.state.nature = giveOne(context.state.nature, id, now)
      return leftAt(context.state.nature, id, now)
    },
  },
})

export default Nature
