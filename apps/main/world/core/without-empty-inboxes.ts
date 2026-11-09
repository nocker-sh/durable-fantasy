import type { Inbox } from "#/world/core/exchange-types"

/** The boxes still holding gold or goods; an empty one is not kept on the board's record (economy.md §5). */
export function withoutEmptyInboxes(inbox: Readonly<Record<string, Inbox>>): Record<string, Inbox> {
  return Object.fromEntries(Object.entries(inbox).filter((entry) => entry[1].gold !== 0 || entry[1].items.length > 0))
}
