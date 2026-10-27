// One party (game-system.md §10, core/party.ts): who is in it, who leads, how experience is shared,
// and each member's HP and map as their room last reported.
import { defineDurableState } from "void/durable"
import { emptyParty, join, leave, report, type Member, type Party as PartyState, type ShareMode } from "#/world/core/party.ts"
import { emptyPartyChat, joinPartyChat, leavePartyChat, sendPartyChat, readPartyChat } from "#/world/core/party-chat.ts"

export const Party = defineDurableState({
  initialState: { party: emptyParty() as PartyState, chat: emptyPartyChat() },
  methods: {
    say(context, owner: string, text: string) {
      const result = sendPartyChat(context.state.chat ?? emptyPartyChat(), context.state.party, owner, text, Date.now())
      context.state.chat = result.chat
      return result.reason ?? null
    },
    chat(context, owner: string, after: number) {
      return readPartyChat(context.state.chat ?? emptyPartyChat(), context.state.party, owner, after, Date.now())
    },
    view(context): PartyState {
      return context.state.party
    },
    /** Add a member; false when the party is full. */
    join(context, m: Member): boolean {
      const next = join(context.state.party, m)
      if (!next) return false
      if (!context.state.party.members.some((member) => member.owner === m.owner)) context.state.chat = joinPartyChat(context.state.chat ?? emptyPartyChat(), m.owner)
      context.state.party = next
      return true
    },
    leave(context, owner: string): PartyState {
      context.state.party = leave(context.state.party, owner)
      context.state.chat = leavePartyChat(context.state.chat ?? emptyPartyChat(), context.state.party)
      return context.state.party
    },
    /** One consistent view of the roster and visible chat, saved in one operation. */
    poll(context, owner: string, status: Omit<Member, "owner">, after: number) {
      context.state.party = report(context.state.party, owner, status)
      return { party: context.state.party, chat: readPartyChat(context.state.chat ?? emptyPartyChat(), context.state.party, owner, after, Date.now()) }
    },
    setMode(context, owner: string, mode: ShareMode): PartyState {
      if (context.state.party.leader === owner) context.state.party = { ...context.state.party, mode }
      return context.state.party
    },
  },
})

export default Party
