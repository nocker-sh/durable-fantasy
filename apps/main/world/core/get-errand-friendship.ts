import { befriend } from "#/world/core/befriend"
import { FRIEND } from "#/world/core/friendship-rules"
import type { Errand } from "#/world/core/errand-types"

/** 持込みは依頼元、配達は依頼元と受取人への親しさを分けて返す。 */
export function getErrandFriendship(previous: Readonly<Record<string, number>>, errand: Errand) {
  if (errand.kind === "bring") {
    const friends = befriend(previous, errand.from, FRIEND.bring)
    return { friends, changed: { [errand.from]: friends[errand.from] } }
  }
  const friends = befriend(befriend(previous, errand.from, FRIEND.deliver), errand.to, FRIEND.received)

  return { friends, changed: { [errand.from]: friends[errand.from], [errand.to]: friends[errand.to] } }
}
