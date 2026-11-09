import { Player } from "#/durable-objects/player"
import { sessionCookie } from "#/world/server/session-cookie"
import { secretHash } from "#/world/server/secret-hash"

export async function authenticatedPlayer(request: Request): Promise<string | null> {
  const cookie = sessionCookie(request)
  if (!cookie) return null
  return (await Player.get(cookie.id).authenticate(await secretHash(cookie.secret))) ? cookie.id : null
}
