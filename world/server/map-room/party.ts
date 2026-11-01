import { handlePartyInvite } from "#/world/server/map-room/handle-party-invite"
import { handlePartyAnswer } from "#/world/server/map-room/handle-party-answer"
import { handlePartyLeave } from "#/world/server/map-room/handle-party-leave"
import { handlePartyMode } from "#/world/server/map-room/handle-party-mode"
import { handlePartyLook } from "#/world/server/map-room/handle-party-look"
import { handlePartyMember } from "#/world/server/map-room/handle-party-member"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  "party-invite": handlePartyInvite,
  "party-answer": handlePartyAnswer,
  "party-leave": handlePartyLeave,
  "party-mode": handlePartyMode,
  "party-look": handlePartyLook,
  "party-kick": handlePartyMember,
  "party-lead": handlePartyMember,
}
