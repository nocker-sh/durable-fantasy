import { STORAGE } from "#/world/client/identity"
import { openSession } from "#/world/client/open-session"

const session: { value: Promise<string> | null } = { value: null }

export function loadPlayerId(): Promise<string> {
  return (session.value ??= (navigator.locks ? navigator.locks.request(`${STORAGE}/session`, openSession) : openSession()).finally(() => {
    session.value = null
  }))
}
