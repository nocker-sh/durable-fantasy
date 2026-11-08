import type { Party } from "#/world/core/party/types"
import type { Ctx } from "#/world/server/map-room/context"
import { notifyClient } from "#/world/server/map-room/notifications"
import { partyView } from "#/world/server/map-room/party-view"
import { presence } from "#/world/server/map-room/presence"
import { setPresence } from "#/world/server/map-room/set-presence"

type Props = Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "state" | "setState" | "send">; party: Party; partyId: string; owner: string }>

/** Publish opaque selectors whose private owner bindings survive status polls, never member replacement. */
export async function sendPartyView(props: Props) {
  const previous = presence(props.connection).partySelection
  const reusable = previous?.connection === props.connection.id && previous.owner === props.owner && previous.party === props.partyId
  let serial = previous?.serial ?? 0
  const members = props.party.members.map((member) => {
    const existing = reusable && previous.members.find((entry) => entry.owner === member.owner)
    if (existing) return existing
    if (!Number.isSafeInteger(serial) || serial < 0 || serial === Number.MAX_SAFE_INTEGER) throw new Error("Party selection counter exhausted")
    serial += 1
    return { key: `${props.connection.id}:${serial}`, owner: member.owner }
  })
  const view = partyView(
    props.party,
    props.owner,
    members.map((member) => member.key),
  )
  setPresence(props.connection, { partySelection: { connection: props.connection.id, owner: props.owner, party: props.partyId, serial, members } })
  await notifyClient(props.connection.send({ type: "party", view }))
}
