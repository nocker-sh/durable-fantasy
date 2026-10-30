// One party (game-system.md §10, core/party.ts): who is in it, who leads, how experience is shared,
// and each member's HP and map as their room last reported.
import { defineDurableState } from "void/durable"
import { emptyParty } from "#/world/core/party/empty-party"
import { join } from "#/world/core/party/join"
import { leave } from "#/world/core/party/leave"
import { report } from "#/world/core/party/report"
import { type Member, type Party as PartyState, type ShareMode } from "#/world/core/party/types"
import { emptyPartyChat } from "#/world/core/empty-party-chat"
import { joinPartyChat } from "#/world/core/join-party-chat"
import { leavePartyChat } from "#/world/core/leave-party-chat"
import { sendPartyChat } from "#/world/core/send-party-chat"
import { readPartyChat } from "#/world/core/read-party-chat"

export const Party = defineDurableState({
  initialState: { party: emptyParty() as PartyState, chat: emptyPartyChat() },
  methods: {
    say(context, owner: string, text: string) {
      const result = sendPartyChat({ chat: context.state.chat ?? emptyPartyChat(), party: context.state.party, owner: owner, text: text, now: Date.now() })
      context.state.chat = result.chat
      return result.reason ?? null
    },
    chat(context, owner: string, after: number) {
      return readPartyChat({ chat: context.state.chat ?? emptyPartyChat(), party: context.state.party, owner: owner, after: after, now: Date.now() })
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
    poll(context, input: { owner: string; status: Omit<Member, "owner">; after: number }) {
      const owner = input.owner
      const status = input.status
      const after = input.after

      context.state.party = report(context.state.party, owner, status)
      return { party: context.state.party, chat: readPartyChat({ chat: context.state.chat ?? emptyPartyChat(), party: context.state.party, owner: owner, after: after, now: Date.now() }) }
    },
    setMode(context, owner: string, mode: ShareMode): PartyState {
      if (context.state.party.leader === owner) context.state.party = { ...context.state.party, mode }
      return context.state.party
    },
  },
})

export default Party
